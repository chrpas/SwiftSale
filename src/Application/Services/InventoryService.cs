using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Domain.Exceptions;

namespace SwiftSale.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreateStockAdjustmentDto> _adjustmentValidator;

    public InventoryService(
        IAppDbContext db,
        IValidator<CreateStockAdjustmentDto> adjustmentValidator)
    {
        _db = db;
        _adjustmentValidator = adjustmentValidator;
    }

    public async Task<StockMovementDto> AdjustStockAsync(CreateStockAdjustmentDto dto, CancellationToken cancellationToken = default)
    {
        await _adjustmentValidator.ValidateAndThrowAsync(dto, cancellationToken);

        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var product = await _db.Products
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), dto.ProductId);

        var balance = product.InventoryBalance;
        if (balance == null)
        {
            balance = new InventoryBalance
            {
                ProductId = product.Id,
                QuantityOnHand = 0m,
                ReservedQuantity = 0m,
                AverageCost = product.CostPrice
            };
            product.InventoryBalance = balance;
            await _db.InventoryBalances.AddAsync(balance, cancellationToken);
        }

        var unitCost = dto.UnitCost ?? balance.AverageCost;

        if (dto.Type == StockMovementType.AdjustmentOut)
        {
            if (balance.QuantityOnHand - dto.Quantity < 0)
            {
                throw new InsufficientStockException(
                    product.Id, 
                    product.SKU, 
                    dto.Quantity, 
                    balance.QuantityOnHand);
            }

            balance.QuantityOnHand -= dto.Quantity;
        }
        else if (dto.Type == StockMovementType.AdjustmentIn)
        {
            var oldQty = balance.QuantityOnHand;
            var newQty = oldQty + dto.Quantity;

            // Recalculate weighted average cost on inbound adjustment if new unit cost provided
            if (dto.UnitCost.HasValue && newQty > 0)
            {
                var totalValue = (oldQty * balance.AverageCost) + (dto.Quantity * dto.UnitCost.Value);
                balance.AverageCost = Math.Round(totalValue / newQty, 2);
            }

            balance.QuantityOnHand = newQty;
        }
        else
        {
            throw new BusinessRuleException($"Unsupported adjustment movement type '{dto.Type}'.");
        }

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Type = dto.Type,
            Quantity = dto.Quantity,
            UnitCost = unitCost,
            ReferenceType = "ManualAdjustment",
            ReferenceId = null,
            Reason = dto.Reason.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _db.StockMovements.AddAsync(movement, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new StockMovementDto(
            movement.Id,
            product.Id,
            product.SKU,
            product.Name,
            movement.Type,
            movement.Quantity,
            movement.UnitCost,
            movement.ReferenceType,
            movement.ReferenceId,
            movement.Reason,
            movement.CreatedAt
        );
    }

    public async Task<List<StockMovementDto>> GetMovementsByProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var movements = await _db.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .Where(m => m.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return movements.Select(m => new StockMovementDto(
            m.Id,
            m.ProductId,
            m.Product?.SKU,
            m.Product?.Name,
            m.Type,
            m.Quantity,
            m.UnitCost,
            m.ReferenceType,
            m.ReferenceId,
            m.Reason,
            m.CreatedAt
        )).ToList();
    }

    public async Task<List<StockMovementDto>> GetRecentMovementsAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        var movements = await _db.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return movements.Select(m => new StockMovementDto(
            m.Id,
            m.ProductId,
            m.Product?.SKU,
            m.Product?.Name,
            m.Type,
            m.Quantity,
            m.UnitCost,
            m.ReferenceType,
            m.ReferenceId,
            m.Reason,
            m.CreatedAt
        )).ToList();
    }

    public async Task<List<LowStockProductDto>> GetLowStockProductsAsync(CancellationToken cancellationToken = default)
    {
        var lowStock = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .Where(p => p.IsActive && p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand <= p.ReorderLevel)
            .OrderBy(p => p.InventoryBalance!.QuantityOnHand - p.ReorderLevel)
            .ToListAsync(cancellationToken);

        return lowStock.Select(p => new LowStockProductDto(
            p.Id,
            p.SKU,
            p.Name,
            p.Category?.Name,
            p.InventoryBalance?.QuantityOnHand ?? 0m,
            p.ReorderLevel,
            p.ReorderLevel - (p.InventoryBalance?.QuantityOnHand ?? 0m)
        )).ToList();
    }

    public async Task<InventoryBalanceDto> GetInventoryBalanceAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.InventoryBalance)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), productId);

        var balance = product.InventoryBalance;
        var onHand = balance?.QuantityOnHand ?? 0m;
        var reserved = balance?.ReservedQuantity ?? 0m;
        var avgCost = (balance != null && balance.AverageCost > 0m) ? balance.AverageCost : product.CostPrice;

        return new InventoryBalanceDto(
            product.Id,
            product.SKU,
            product.Name,
            product.CategoryId,
            product.Category?.Name,
            product.IsActive,
            onHand,
            reserved,
            onHand - reserved,
            avgCost,
            product.SellingPrice,
            product.ReorderLevel,
            onHand * avgCost,
            product.PiecesPerBox,
            product.UnitIdentifier ?? "PCS"
        );
    }

    public async Task<List<InventoryBalanceDto>> GetAllBalancesAsync(bool? activeOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.InventoryBalance)
            .Include(p => p.Category)
            .AsQueryable();

        if (activeOnly.HasValue)
        {
            query = query.Where(p => p.IsActive == activeOnly.Value);
        }

        var products = await query
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products.Select(p =>
        {
            var onHand = p.InventoryBalance?.QuantityOnHand ?? 0m;
            var reserved = p.InventoryBalance?.ReservedQuantity ?? 0m;
            var avgCost = (p.InventoryBalance != null && p.InventoryBalance.AverageCost > 0m) ? p.InventoryBalance.AverageCost : p.CostPrice;

            return new InventoryBalanceDto(
                p.Id,
                p.SKU,
                p.Name,
                p.CategoryId,
                p.Category?.Name,
                p.IsActive,
                onHand,
                reserved,
                onHand - reserved,
                avgCost,
                p.SellingPrice,
                p.ReorderLevel,
                onHand * avgCost,
                p.PiecesPerBox,
                p.UnitIdentifier ?? "PCS"
            );
        }).ToList();
    }
}
