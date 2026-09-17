using SwiftSale.Domain.Enums;

namespace SwiftSale.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SaleId { get; set; }
    public Sale? Sale { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Cleared;
    public string? ReferenceNo { get; set; }

    public string? BankName { get; set; }
    public string? CheckNumber { get; set; }
    public DateTime? CheckDate { get; set; }
    public DateTime? ClearedDate { get; set; }
    public string? DishonorReason { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}
