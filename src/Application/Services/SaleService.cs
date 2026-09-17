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

        // Pre-validate all products exist and aggregate deduction in base pieces (PCS)
        var deductionsPerProduct = new Dictionary<Guid, decimal>();
        foreach (var item in dto.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                throw new NotFoundException(nameof(Product), item.ProductId);
            }

            var unitSold = (item.UnitSold ?? "PCS").Trim().ToUpperInvariant();
            var piecesPerBox = product.PiecesPerBox > 0 ? product.PiecesPerBox : 1;
            var deduction = unitSold == "BOX" ? item.Quantity * piecesPerBox : item.Quantity;

            deductionsPerProduct[product.Id] = deductionsPerProduct.GetValueOrDefault(product.Id) + deduction;
        }

        foreach (var (productId, totalDeduction) in deductionsPerProduct)
        {
            var product = products[productId];
            var available = product.InventoryBalance?.QuantityOnHand ?? 0m;
            if (available - totalDeduction < 0)
            {
                throw new InsufficientStockException(
                    product.Id,
                    product.SKU,
                    totalDeduction,
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

            var unitSold = (item.UnitSold ?? "PCS").Trim().ToUpperInvariant();
            if (unitSold != "BOX") unitSold = "PCS";

            var piecesPerBox = product.PiecesPerBox > 0 ? product.PiecesPerBox : 1;
            var deduction = unitSold == "BOX" ? item.Quantity * piecesPerBox : item.Quantity;

            var defaultUnitPrice = unitSold == "BOX"
                ? product.SellingPrice * piecesPerBox
                : product.SellingPrice;

            var unitPrice = item.UnitPrice ?? defaultUnitPrice;
            var lineSubtotal = item.Quantity * unitPrice;
            var lineTotal = lineSubtotal - item.Discount;

            subtotal += lineSubtotal;
            totalDiscount += item.Discount;

            // 1. Dual-Ledger Inventory Rule: Deduct Balance in Base Pieces
            balance.QuantityOnHand -= deduction;

            // 2. Dual-Ledger Inventory Rule: Accompanying StockMovement in Base Pieces
            var movement = new StockMovement
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Type = StockMovementType.SaleOut,
                Quantity = deduction,
                UnitCost = balance.AverageCost,
                ReferenceType = "Sale",
                ReferenceId = saleId,
                Reason = $"Sold {item.Quantity} {unitSold} ({deduction} PCS)",
                CreatedAt = DateTime.UtcNow
            };
            await _db.StockMovements.AddAsync(movement, cancellationToken);

            var saleItem = new SaleItem
            {
                Id = Guid.NewGuid(),
                SaleId = saleId,
                ProductId = product.Id,
                UnitSold = unitSold,
                QuantitySold = item.Quantity,
                BaseQuantityDeducted = deduction,
                Quantity = deduction,
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
        decimal clearedPaidAmount = 0m;
        if (dto.Payments != null && dto.Payments.Count > 0)
        {
            foreach (var paymentDto in dto.Payments)
            {
                if (paymentDto.Method == PaymentMethod.Check || paymentDto.Method == PaymentMethod.PostDatedCheck)
                {
                    if (string.IsNullOrWhiteSpace(paymentDto.BankName) || string.IsNullOrWhiteSpace(paymentDto.CheckNumber) || !paymentDto.CheckDate.HasValue)
                    {
                        throw new BusinessRuleException("Bank name, check number, and check date are required for check payments.");
                    }
                }

                PaymentStatus status;
                if (paymentDto.Status.HasValue)
                {
                    status = paymentDto.Status.Value;
                }
                else if (paymentDto.Method == PaymentMethod.PostDatedCheck || (paymentDto.CheckDate.HasValue && paymentDto.CheckDate.Value.Date > DateTime.UtcNow.Date))
                {
                    status = PaymentStatus.Pending;
                }
                else
                {
                    status = PaymentStatus.Cleared;
                }

                if (status == PaymentStatus.Cleared)
                {
                    clearedPaidAmount += paymentDto.Amount;
                }

                sale.Payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    SaleId = saleId,
                    Amount = paymentDto.Amount,
                    Method = paymentDto.Method,
                    Status = status,
                    ReferenceNo = paymentDto.ReferenceNo?.Trim(),
                    BankName = paymentDto.BankName?.Trim(),
                    CheckNumber = paymentDto.CheckNumber?.Trim(),
                    CheckDate = NormalizeToUtc(paymentDto.CheckDate),
                    ClearedDate = status == PaymentStatus.Cleared ? DateTime.UtcNow : null,
                    PaymentDate = DateTime.UtcNow
                });
            }
        }

        sale.PaidAmount = clearedPaidAmount;
        sale.Balance = Math.Max(0, sale.Total - clearedPaidAmount);

        if (sale.Balance > 0)
        {
            sale.Status = SaleStatus.PendingClearance;
        }

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

        // Dual-Ledger Invariant: Restore stock & record SaleVoidReturn movements in Base Pieces
        foreach (var item in sale.Items)
        {
            if (item.Product != null)
            {
                var returnQty = item.BaseQuantityDeducted > 0 ? item.BaseQuantityDeducted : item.Quantity;
                var balance = item.Product.InventoryBalance;
                if (balance != null)
                {
                    balance.QuantityOnHand += returnQty;
                }

                var unitCost = balance?.AverageCost ?? item.Product.CostPrice;

                var movement = new StockMovement
                {
                    Id = Guid.NewGuid(),
                    ProductId = item.ProductId,
                    Type = StockMovementType.SaleVoidReturn,
                    Quantity = returnQty,
                    UnitCost = unitCost,
                    ReferenceType = "SaleVoid",
                    ReferenceId = sale.Id,
                    Reason = $"Voided invoice {sale.InvoiceNo}: {dto.Reason.Trim()} (restored {returnQty} PCS)",
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

        if (dto.Method == PaymentMethod.Check || dto.Method == PaymentMethod.PostDatedCheck)
        {
            if (string.IsNullOrWhiteSpace(dto.BankName) || string.IsNullOrWhiteSpace(dto.CheckNumber) || !dto.CheckDate.HasValue)
            {
                throw new BusinessRuleException("Bank name, check number, and check date are required for check payments.");
            }
        }

        PaymentStatus status;
        if (dto.Status.HasValue)
        {
            status = dto.Status.Value;
        }
        else if (dto.Method == PaymentMethod.PostDatedCheck || (dto.CheckDate.HasValue && dto.CheckDate.Value.Date > DateTime.UtcNow.Date))
        {
            status = PaymentStatus.Pending;
        }
        else
        {
            status = PaymentStatus.Cleared;
        }

        sale.Payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            SaleId = sale.Id,
            Amount = dto.Amount,
            Method = dto.Method,
            Status = status,
            ReferenceNo = dto.ReferenceNo?.Trim(),
            BankName = dto.BankName?.Trim(),
            CheckNumber = dto.CheckNumber?.Trim(),
            CheckDate = NormalizeToUtc(dto.CheckDate),
            ClearedDate = status == PaymentStatus.Cleared ? DateTime.UtcNow : null,
            PaymentDate = DateTime.UtcNow
        });

        var clearedPaidAmount = sale.Payments.Where(p => p.Status == PaymentStatus.Cleared).Sum(p => p.Amount);
        sale.PaidAmount = clearedPaidAmount;
        sale.Balance = Math.Max(0, sale.Total - clearedPaidAmount);

        if (sale.Balance == 0 && sale.Status == SaleStatus.PendingClearance)
        {
            sale.Status = SaleStatus.Completed;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(sale.Id, cancellationToken);
    }

    public async Task<SaleDto> ClearCheckPaymentAsync(Guid paymentId, CancellationToken cancellationToken = default)
    {
        var payment = await _db.Payments
            .Include(p => p.Sale)
            .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        if (payment.Status == PaymentStatus.Cleared)
        {
            throw new BusinessRuleException("Payment is already marked as cleared.");
        }

        payment.Status = PaymentStatus.Cleared;
        payment.ClearedDate = DateTime.UtcNow;

        if (payment.Sale != null)
        {
            var sale = payment.Sale;
            var allPayments = await _db.Payments.Where(p => p.SaleId == sale.Id).ToListAsync(cancellationToken);
            var clearedPaidAmount = allPayments.Where(p => p.Status == PaymentStatus.Cleared).Sum(p => p.Amount);

            sale.PaidAmount = clearedPaidAmount;
            sale.Balance = Math.Max(0, sale.Total - clearedPaidAmount);

            if (sale.Balance == 0 && sale.Status == SaleStatus.PendingClearance)
            {
                sale.Status = SaleStatus.Completed;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(payment.SaleId, cancellationToken);
    }

    public async Task<SaleDto> DishonorCheckAndReturnSaleAsync(Guid saleId, Guid paymentId, string reason, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var sale = await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .FirstOrDefaultAsync(s => s.Id == saleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), saleId);

        var payment = sale.Payments.FirstOrDefault(p => p.Id == paymentId)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        // Step 1: Mark Payment as Dishonored
        payment.Status = PaymentStatus.Dishonored;
        payment.DishonorReason = string.IsNullOrWhiteSpace(reason) ? "Insufficient funds / NSF" : reason.Trim();

        // Step 2 & 3: Stock Restoration & Void Sale Status
        if (sale.Status != SaleStatus.Voided)
        {
            sale.Status = SaleStatus.Voided;

            foreach (var item in sale.Items)
            {
                if (item.Product != null)
                {
                    var returnQty = item.BaseQuantityDeducted > 0 ? item.BaseQuantityDeducted : item.Quantity;
                    var balance = item.Product.InventoryBalance;
                    if (balance != null)
                    {
                        balance.QuantityOnHand += returnQty;
                    }

                    var unitCost = balance?.AverageCost ?? item.Product.CostPrice;
                    var checkRef = !string.IsNullOrWhiteSpace(payment.CheckNumber) ? payment.CheckNumber : payment.ReferenceNo ?? "N/A";

                    var movement = new StockMovement
                    {
                        Id = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        Type = StockMovementType.SaleVoidReturn,
                        Quantity = returnQty,
                        UnitCost = unitCost,
                        ReferenceType = "CheckBouncedReturn",
                        ReferenceId = sale.Id,
                        Reason = $"Item pull-out: Bounced Check #{checkRef} (Inv #{sale.InvoiceNo}) - {payment.DishonorReason}",
                        CreatedAt = DateTime.UtcNow
                    };
                    await _db.StockMovements.AddAsync(movement, cancellationToken);
                }
            }
        }

        var clearedPaidAmount = sale.Payments.Where(p => p.Status == PaymentStatus.Cleared).Sum(p => p.Amount);
        sale.PaidAmount = clearedPaidAmount;
        sale.Balance = Math.Max(0, sale.Total - clearedPaidAmount);

        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

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
            var baseQty = i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity;
            var lineCost = baseQty * avgCost;
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
                lineProfit,
                i.UnitSold ?? "PCS",
                i.QuantitySold > 0 ? i.QuantitySold : i.Quantity,
                baseQty
            );
        }).ToList();

        var payments = sale.Payments.Select(p => new PaymentDto(
            p.Id,
            p.Amount,
            p.Method,
            p.Status,
            p.ReferenceNo,
            p.PaymentDate,
            p.BankName,
            p.CheckNumber,
            p.CheckDate,
            p.ClearedDate,
            p.DishonorReason
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

    private static DateTime? NormalizeToUtc(DateTime? dt)
    {
        if (!dt.HasValue) return null;
        return dt.Value.Kind == DateTimeKind.Utc
            ? dt.Value
            : DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc);
    }
}
