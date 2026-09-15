using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Sales;

public record CreateSaleItemDto(
    Guid ProductId,
    decimal Quantity,
    decimal? UnitPrice = null,
    decimal Discount = 0m
);

public record CreatePaymentDto(
    decimal Amount,
    PaymentMethod Method,
    string? ReferenceNo = null
);

public record CreateSaleDto(
    Guid? CustomerId,
    List<CreateSaleItemDto> Items,
    List<CreatePaymentDto>? Payments = null,
    string? DeliveryReceiptNo = null
);

public record VoidSaleDto(
    Guid SaleId,
    string Reason
);
