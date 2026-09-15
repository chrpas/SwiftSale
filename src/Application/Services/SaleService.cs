using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Sales;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Domain.Exceptions;

namespace SwiftSale.Application.Services;

public class SaleService : ISaleService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreateSaleDto> _createValidator;
    private readonly IValidator<VoidSaleDto> _voidValidator;

    public SaleService(
        IAppDbContext db,
        IValidator<CreateSaleDto> createValidator,
        IValidator<VoidSaleDto> voidValidator)
    {
        _db = db;
        _createValidator = createValidator;
        _voidValidator = voidValidator;
    }

    public async Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(dto, cancellationToken);

        if (dto.CustomerId.HasValue)
        {
            var customerExists = await _db.Customers.AnyAsync(c => c.Id == dto.CustomerId.Value, cancellationToken);
            if (!customerExists)
            {
                throw new NotFoundException(nameof(Customer), dto.CustomerId.Value);
            }
        }

        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products
            .Include(p => p.InventoryBalance)
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        // Pre-validate all products exist and have sufficient stock
        foreach (var item in dto.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                throw new NotFoundException(nameof(Product), item.ProductId);
            }

            var balance = product.InventoryBalance;
            var available = balance?.QuantityOnHand ?? 0m;

            if (available - item.Quantity < 0)
            {
                throw new InsufficientStockException(
                    product.Id,
                    product.SKU,
                    item.Quantity,
                    available
                );
            }
        }

        var saleId = Guid.NewGuid();
        var invoiceNo = await GenerateInvoiceNumberAsync(cancellationToken);

        var sale = new Sale
        {
            Id = saleId,
            CustomerId = dto.CustomerId,
            InvoiceNo = invoiceNo,
            DeliveryReceiptNo = dto.DeliveryReceiptNo?.Trim(),
            SaleDate = DateTime.UtcNow,
            Status = SaleStatus.Completed,
            Subtotal = 0m,
            Discount = 0m,
            Total = 0m,
            PaidAmount = 0m,
            Balance = 0m
        };

        decimal subtotal = 0m;
        decimal totalDiscount = 0m;

        foreach (var item in dto.Items)
        {
            var product = products[item.ProductId];
            var balance = product.InventoryBalance!;

            var unitPrice = item.UnitPrice ?? product.SellingPrice;
            var lineSubtotal = item.Quantity * unitPrice;
            var lineTotal = lineSubtotal - item.Discount;

            subtotal += lineSubtotal;
            totalDiscount += item.Discount;

            // 1. Dual-Ledger Inventory Rule: Deduct Balance
            balance.QuantityOnHand -= item.Quantity;

            // 2. Dual-Ledger Inventory Rule: Accompanying StockMovement
            var movement = new StockMovement
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Type = StockMovementType.SaleOut,
                Quantity = item.Quantity,
                UnitCost = balance.AverageCost,
                ReferenceType = "Sale",
                ReferenceId = saleId,
                Reason = $"Sale invoice {invoiceNo}",
                CreatedAt = DateTime.UtcNow
            };
            await _db.StockMovements.AddAsync(movement, cancellationToken);

            var saleItem = new SaleItem
            {
                Id = Guid.NewGuid(),
                SaleId = saleId,
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                Discount = item.Discount,
                Total = lineTotal
            };
            sale.Items.Add(saleItem);
        }

        sale.Subtotal = subtotal;
        sale.Discount = totalDiscount;
        sale.Total = subtotal - totalDiscount;

        // Process Payments
        decimal paidAmount = 0m;
        if (dto.Payments != null && dto.Payments.Count > 0)
        {
            foreach (var paymentDto in dto.Payments)
            {
                paidAmount += paymentDto.Amount;
                sale.Payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    SaleId = saleId,
                    Amount = paymentDto.Amount,
                    Method = paymentDto.Method,
                    ReferenceNo = paymentDto.ReferenceNo?.Trim(),
                    PaymentDate = DateTime.UtcNow
                });
            }
        }

        sale.PaidAmount = paidAmount;
        sale.Balance = sale.Total - paidAmount;

        await _db.Sales.AddAsync(sale, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(saleId, cancellationToken);
    }

    public async Task<SaleDto> VoidSaleAsync(VoidSaleDto dto, CancellationToken cancellationToken = default)
    {
        await _voidValidator.ValidateAndThrowAsync(dto, cancellationToken);

        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var sale = await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .FirstOrDefaultAsync(s => s.Id == dto.SaleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), dto.SaleId);

        if (sale.Status == SaleStatus.Voided)
        {
            throw new BusinessRuleException($"Sale with Invoice '{sale.InvoiceNo}' is already voided.");
        }

        sale.Status = SaleStatus.Voided;

        // Dual-Ledger Invariant: Restore stock & record SaleVoidReturn movements
        foreach (var item in sale.Items)
        {
            if (item.Product != null)
            {
                var balance = item.Product.InventoryBalance;
                if (balance != null)
                {
                    balance.QuantityOnHand += item.Quantity;
                }

                var unitCost = balance?.AverageCost ?? item.Product.CostPrice;

                var movement = new StockMovement
                {
                    Id = Guid.NewGuid(),
                    ProductId = item.ProductId,
                    Type = StockMovementType.SaleVoidReturn,
                    Quantity = item.Quantity,
                    UnitCost = unitCost,
                    ReferenceType = "SaleVoid",
                    ReferenceId = sale.Id,
                    Reason = $"Voided invoice {sale.InvoiceNo}: {dto.Reason.Trim()}",
                    CreatedAt = DateTime.UtcNow
                };
                await _db.StockMovements.AddAsync(movement, cancellationToken);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(sale.Id, cancellationToken);
    }

    public async Task<SaleDto> AddPaymentAsync(Guid saleId, CreatePaymentDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Amount <= 0)
        {
            throw new BusinessRuleException("Payment amount must be greater than zero.");
        }

        var sale = await _db.Sales
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == saleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), saleId);

        if (sale.Status == SaleStatus.Voided)
        {
            throw new BusinessRuleException($"Cannot add payment to voided sale '{sale.InvoiceNo}'.");
        }

        sale.Payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            SaleId = sale.Id,
            Amount = dto.Amount,
            Method = dto.Method,
            ReferenceNo = dto.ReferenceNo?.Trim(),
            PaymentDate = DateTime.UtcNow
        });

        sale.PaidAmount += dto.Amount;
        sale.Balance = sale.Total - sale.PaidAmount;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(sale.Id, cancellationToken);
    }

    public async Task<SaleDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sale = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), id);

        return MapToDto(sale);
    }

    public async Task<SaleDto?> GetByInvoiceNoAsync(string invoiceNo, CancellationToken cancellationToken = default)
    {
        var sale = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .FirstOrDefaultAsync(s => s.InvoiceNo == invoiceNo.Trim(), cancellationToken);

        return sale != null ? MapToDto(sale) : null;
    }

    public async Task<List<SaleDto>> GetSalesAsync(
        DateTime? fromDate = null, 
        DateTime? toDate = null, 
        Guid? customerId = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(s => s.SaleDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(s => s.SaleDate <= toDate.Value);
        }

        if (customerId.HasValue)
        {
            query = query.Where(s => s.CustomerId == customerId.Value);
        }

        var sales = await query
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync(cancellationToken);

        return sales.Select(MapToDto).ToList();
    }

    private async Task<string> GenerateInvoiceNumberAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"INV-{today}-";

        var lastInvoice = await _db.Sales
            .Where(s => s.InvoiceNo.StartsWith(prefix))
            .OrderByDescending(s => s.InvoiceNo)
            .Select(s => s.InvoiceNo)
            .FirstOrDefaultAsync(cancellationToken);

        int sequence = 1;
        if (!string.IsNullOrEmpty(lastInvoice))
        {
            var parts = lastInvoice.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}{sequence:D4}";
    }

    public static SaleDto MapToDto(Sale sale)
    {
        decimal totalEstimatedCost = 0m;

        var items = sale.Items.Select(i =>
        {
            var avgCost = i.Product?.InventoryBalance?.AverageCost ?? i.Product?.CostPrice ?? 0m;
            var lineCost = i.Quantity * avgCost;
            var lineProfit = i.Total - lineCost;

            totalEstimatedCost += lineCost;

            return new SaleItemDto(
                i.Id,
                i.ProductId,
                i.Product?.SKU,
                i.Product?.Name,
                i.Quantity,
                i.UnitPrice,
                i.Discount,
                i.Total,
                lineCost,
                lineProfit
            );
        }).ToList();

        var payments = sale.Payments.Select(p => new PaymentDto(
            p.Id,
            p.Amount,
            p.Method,
            p.ReferenceNo,
            p.PaymentDate
        )).ToList();

        var grossProfit = sale.Total - totalEstimatedCost;
        var grossMarginPercent = sale.Total > 0 
            ? Math.Round((grossProfit / sale.Total) * 100m, 2) 
            : 0m;

        return new SaleDto(
            sale.Id,
            sale.CustomerId,
            sale.Customer?.Name,
            sale.InvoiceNo,
            sale.DeliveryReceiptNo,
            sale.SaleDate,
            sale.Status,
            sale.Subtotal,
            sale.Discount,
            sale.Total,
            sale.PaidAmount,
            sale.Balance,
            totalEstimatedCost,
            grossProfit,
            grossMarginPercent,
            items,
            payments
        );
    }
}
