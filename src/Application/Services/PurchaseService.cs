using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Purchases;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Domain.Exceptions;

namespace SwiftSale.Application.Services;

public class PurchaseService : IPurchaseService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreatePurchaseDto> _validator;

    public PurchaseService(IAppDbContext db, IValidator<CreatePurchaseDto> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(dto, cancellationToken);

        var supplier = await _db.Suppliers.FindAsync([dto.SupplierId], cancellationToken)
            ?? throw new NotFoundException(nameof(Supplier), dto.SupplierId);

        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products
            .Include(p => p.InventoryBalance)
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        foreach (var item in dto.Items)
        {
            if (!products.ContainsKey(item.ProductId))
            {
                throw new NotFoundException(nameof(Product), item.ProductId);
            }
        }

        var purchaseId = Guid.NewGuid();
        var purchase = new Purchase
        {
            Id = purchaseId,
            SupplierId = supplier.Id,
            ReferenceNo = dto.ReferenceNo.Trim(),
            PurchaseDate = dto.PurchaseDate ?? DateTime.UtcNow,
            Status = PurchaseStatus.Completed,
            TotalCost = dto.Items.Sum(i => i.Quantity * i.UnitCost)
        };

        foreach (var item in dto.Items)
        {
            var product = products[item.ProductId];
            var balance = product.InventoryBalance;

            if (balance == null)
            {
                balance = new InventoryBalance
                {
                    ProductId = product.Id,
                    QuantityOnHand = 0m,
                    ReservedQuantity = 0m,
                    AverageCost = item.UnitCost
                };
                product.InventoryBalance = balance;
                await _db.InventoryBalances.AddAsync(balance, cancellationToken);
            }

            // Weighted Average Cost recalculation
            var oldQty = balance.QuantityOnHand;
            var newQty = oldQty + item.Quantity;
            if (newQty > 0)
            {
                var totalValuation = (oldQty * balance.AverageCost) + (item.Quantity * item.UnitCost);
                balance.AverageCost = Math.Round(totalValuation / newQty, 2);
            }
            balance.QuantityOnHand = newQty;

            // Dual-ledger inventory rule: record StockMovement
            var movement = new StockMovement
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Type = StockMovementType.PurchaseIn,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,
                ReferenceType = "Purchase",
                ReferenceId = purchaseId,
                Reason = $"Purchase order {purchase.ReferenceNo}",
                CreatedAt = DateTime.UtcNow
            };
            await _db.StockMovements.AddAsync(movement, cancellationToken);

            var purchaseItem = new PurchaseItem
            {
                Id = Guid.NewGuid(),
                PurchaseId = purchaseId,
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,
                TotalCost = item.Quantity * item.UnitCost
            };
            purchase.Items.Add(purchaseItem);
        }

        await _db.Purchases.AddAsync(purchase, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(purchaseId, cancellationToken);
    }

    public async Task<PurchaseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var purchase = await _db.Purchases
            .AsNoTracking()
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Purchase), id);

        return MapToDto(purchase);
    }

    public async Task<List<PurchaseDto>> GetPurchasesAsync(Guid? supplierId = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Purchases
            .AsNoTracking()
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product)
            .AsQueryable();

        if (supplierId.HasValue)
        {
            query = query.Where(p => p.SupplierId == supplierId.Value);
        }

        var purchases = await query
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync(cancellationToken);

        return purchases.Select(MapToDto).ToList();
    }

    private static PurchaseDto MapToDto(Purchase p) => new(
        p.Id,
        p.SupplierId,
        p.Supplier?.Name,
        p.ReferenceNo,
        p.PurchaseDate,
        p.Status,
        p.TotalCost,
        p.Items.Select(i => new PurchaseItemDto(
            i.Id,
            i.ProductId,
            i.Product?.SKU,
            i.Product?.Name,
            i.Quantity,
            i.UnitCost,
            i.TotalCost
        )).ToList()
    );
}
