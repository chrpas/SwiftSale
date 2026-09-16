namespace SwiftSale.Application.DTOs.Products;

public record ProductDto(
    Guid Id,
    string SKU,
    string Name,
    Guid CategoryId,
    string? CategoryName,
    string? UnitId,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    bool IsActive,
    decimal QuantityOnHand,
    decimal ReservedQuantity,
    decimal QuantityAvailable,
    decimal AverageCost,
    DateTime CreatedAt,
    string UnitIdentifier = "PCS",
    int PiecesPerBox = 1,
    string? Description = null
);
