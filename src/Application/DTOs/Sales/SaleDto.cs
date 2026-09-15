using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Sales;

public record SaleItemDto(
    Guid Id,
    Guid ProductId,
    string? ProductSKU,
    string? ProductName,
    decimal Quantity,
    decimal UnitPrice,
    decimal Discount,
    decimal Total,
    decimal EstimatedCost,
    decimal GrossProfit
);

public record PaymentDto(
    Guid Id,
    decimal Amount,
    PaymentMethod Method,
    string? ReferenceNo,
    DateTime PaymentDate
);

public record SaleDto(
    Guid Id,
    Guid? CustomerId,
    string? CustomerName,
    string InvoiceNo,
    string? DeliveryReceiptNo,
    DateTime SaleDate,
    SaleStatus Status,
    decimal Subtotal,
    decimal Discount,
    decimal Total,
    decimal PaidAmount,
    decimal Balance,
    decimal EstimatedCost,
    decimal GrossProfit,
    decimal GrossMarginPercent,
    List<SaleItemDto> Items,
    List<PaymentDto> Payments
);
