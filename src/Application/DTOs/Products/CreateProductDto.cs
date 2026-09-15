namespace SwiftSale.Application.DTOs.Products;

public record CreateProductDto(
    string SKU,
    string Name,
    Guid CategoryId,
    string? UnitId,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    decimal? InitialStock = null
);
