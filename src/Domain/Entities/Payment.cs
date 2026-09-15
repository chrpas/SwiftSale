using SwiftSale.Domain.Enums;

namespace SwiftSale.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SaleId { get; set; }
    public Sale? Sale { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}
