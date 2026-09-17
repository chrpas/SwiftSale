using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Sales;

public record CreateSaleItemDto(
    Guid ProductId,
    decimal Quantity,
    decimal? UnitPrice = null,
    decimal Discount = 0m,
    string? UnitSold = "PCS"
);

public record CreatePaymentDto(
    decimal Amount,
    PaymentMethod Method,
    string? ReferenceNo = null,
    string? BankName = null,
    string? CheckNumber = null,
    DateTime? CheckDate = null,
    PaymentStatus? Status = null
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

public record DishonorCheckRequest(
    string Reason
);
