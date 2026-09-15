namespace SwiftSale.Application.DTOs.Customers;

public record CreateCustomerDto(
    string Name,
    string? Phone,
    string? Email,
    string? Address
);

public record CustomerDto(
    Guid Id,
    string Name,
    string? Phone,
    string? Email,
    string? Address,
    int TotalSalesCount
);
