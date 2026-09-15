namespace SwiftSale.Application.DTOs.Products;

public record UpdateProductDto(
    string Name,
    Guid CategoryId,
    string? UnitId,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    bool IsActive
);
