namespace SwiftSale.Application.DTOs.Products;

public record CreateProductDto(
    string SKU,
    string Name,
    Guid CategoryId,
    string? UnitId = null,
    decimal CostPrice = 0m,
    decimal SellingPrice = 0m,
    int ReorderLevel = 0,
    decimal? InitialStock = null,
    string? UnitIdentifier = null,
    int PiecesPerBox = 1,
    string? Description = null
);
