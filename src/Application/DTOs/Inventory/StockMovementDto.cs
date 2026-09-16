using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Inventory;

public record StockMovementDto(
    Guid Id,
    Guid ProductId,
    string? ProductSKU,
    string? ProductName,
    StockMovementType Type,
    decimal Quantity,
    decimal UnitCost,
    string ReferenceType,
    Guid? ReferenceId,
    string? Reason,
    DateTime CreatedAt
);

public record InventoryBalanceDto(
    Guid ProductId,
    string? ProductSKU,
    string? ProductName,
    Guid? CategoryId,
    string? CategoryName,
    bool IsActive,
    decimal QuantityOnHand,
    decimal ReservedQuantity,
    decimal QuantityAvailable,
    decimal AverageCost,
    decimal SellingPrice,
    int ReorderLevel,
    decimal TotalValuation,
    int PiecesPerBox = 1,
    string UnitIdentifier = "PCS"
);

public record LowStockProductDto(
    Guid ProductId,
    string SKU,
    string Name,
    string? CategoryName,
    decimal QuantityOnHand,
    int ReorderLevel,
    decimal Deficit
);
