using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Purchases;

public record CreatePurchaseItemDto(
    Guid ProductId,
    decimal Quantity,
    decimal UnitCost
);

public record CreatePurchaseDto(
    Guid SupplierId,
    string ReferenceNo,
    DateTime? PurchaseDate,
    List<CreatePurchaseItemDto> Items
);

public record PurchaseItemDto(
    Guid Id,
    Guid ProductId,
    string? ProductSKU,
    string? ProductName,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost
);

public record PurchaseDto(
    Guid Id,
    Guid SupplierId,
    string? SupplierName,
    string ReferenceNo,
    DateTime PurchaseDate,
    PurchaseStatus Status,
    decimal TotalCost,
    List<PurchaseItemDto> Items
);
