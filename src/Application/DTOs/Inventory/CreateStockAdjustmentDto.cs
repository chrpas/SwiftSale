using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Inventory;

public record CreateStockAdjustmentDto(
    Guid ProductId,
    StockMovementType Type, // Must be AdjustmentIn or AdjustmentOut
    decimal Quantity,
    decimal? UnitCost,
    string Reason
);
