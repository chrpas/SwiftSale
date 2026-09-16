using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Products;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Domain.Exceptions;

namespace SwiftSale.Application.Services;

public class ProductService : IProductService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreateProductDto> _createValidator;
    private readonly IValidator<UpdateProductDto> _updateValidator;

    public ProductService(
        IAppDbContext db,
        IValidator<CreateProductDto> createValidator,
        IValidator<UpdateProductDto> updateValidator)
    {
        _db = db;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        return MapToDto(product);
    }

    public async Task<ProductDto?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.SKU == sku.Trim(), cancellationToken);

        return product != null ? MapToDto(product) : null;
    }

    public async Task<List<ProductDto>> GetAllAsync(bool? activeOnly = null, Guid? categoryId = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .AsQueryable();

        if (activeOnly.HasValue)
        {
            query = query.Where(p => p.IsActive == activeOnly.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var products = await query
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var skuNormalized = dto.SKU.Trim();
        var skuExists = await _db.Products.AnyAsync(p => p.SKU == skuNormalized, cancellationToken);
        if (skuExists)
        {
            throw new BusinessRuleException($"Product SKU '{skuNormalized}' is already in use.");
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException(nameof(Category), dto.CategoryId);
        }

        await using var transaction = await _db.BeginTransactionAsync(cancellationToken);

        var unit = !string.IsNullOrWhiteSpace(dto.UnitIdentifier)
            ? dto.UnitIdentifier.Trim().ToUpperInvariant()
            : (!string.IsNullOrWhiteSpace(dto.UnitId) ? dto.UnitId.Trim().ToUpperInvariant() : "PCS");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            SKU = skuNormalized,
            Name = dto.Name.Trim(),
            CategoryId = dto.CategoryId,
            UnitIdentifier = unit,
            PiecesPerBox = dto.PiecesPerBox > 0 ? dto.PiecesPerBox : 1,
            Description = dto.Description?.Trim(),
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            ReorderLevel = dto.ReorderLevel,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var initialQty = dto.InitialStock ?? 0m;
        var balance = new InventoryBalance
        {
            ProductId = product.Id,
            QuantityOnHand = initialQty,
            ReservedQuantity = 0m,
            AverageCost = dto.CostPrice
        };
        product.InventoryBalance = balance;

        await _db.Products.AddAsync(product, cancellationToken);
        await _db.InventoryBalances.AddAsync(balance, cancellationToken);

        if (initialQty > 0)
        {
            var movement = new StockMovement
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Type = StockMovementType.AdjustmentIn,
                Quantity = initialQty,
                UnitCost = dto.CostPrice,
                ReferenceType = "InitialStock",
                ReferenceId = product.Id,
                Reason = "Initial stock set during product creation",
                CreatedAt = DateTime.UtcNow
            };
            await _db.StockMovements.AddAsync(movement, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var product = await _db.Products
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException(nameof(Category), dto.CategoryId);
        }

        var unit = !string.IsNullOrWhiteSpace(dto.UnitIdentifier)
            ? dto.UnitIdentifier.Trim().ToUpperInvariant()
            : (!string.IsNullOrWhiteSpace(dto.UnitId) ? dto.UnitId.Trim().ToUpperInvariant() : product.UnitIdentifier);

        product.Name = dto.Name.Trim();
        product.CategoryId = dto.CategoryId;
        product.UnitIdentifier = unit;
        product.PiecesPerBox = dto.PiecesPerBox > 0 ? dto.PiecesPerBox : 1;
        product.Description = dto.Description?.Trim();
        product.CostPrice = dto.CostPrice;
        product.SellingPrice = dto.SellingPrice;
        product.ReorderLevel = dto.ReorderLevel;
        product.IsActive = dto.IsActive;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        // Soft delete by deactivating to preserve sales history
        product.IsActive = false;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .Include(p => p.InventoryBalance)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        // Reactivate discontinued product
        product.IsActive = true;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id,
        p.SKU,
        p.Name,
        p.CategoryId,
        p.Category?.Name,
        p.UnitIdentifier,
        p.CostPrice,
        p.SellingPrice,
        p.ReorderLevel,
        p.IsActive,
        p.InventoryBalance?.QuantityOnHand ?? 0m,
        p.InventoryBalance?.ReservedQuantity ?? 0m,
        (p.InventoryBalance?.QuantityOnHand ?? 0m) - (p.InventoryBalance?.ReservedQuantity ?? 0m),
        p.InventoryBalance?.AverageCost ?? p.CostPrice,
        p.CreatedAt,
        p.UnitIdentifier,
        p.PiecesPerBox,
        p.Description
    );
}
