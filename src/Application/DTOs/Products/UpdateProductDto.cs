namespace SwiftSale.Application.DTOs.Products;

public record UpdateProductDto(
    string Name,
    Guid CategoryId,
    string? UnitId,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    bool IsActive,
    string? UnitIdentifier = null,
    int PiecesPerBox = 1,
    string? Description = null
);
