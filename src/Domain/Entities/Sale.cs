using SwiftSale.Domain.Enums;

namespace SwiftSale.Domain.Entities;

public class Sale
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string InvoiceNo { get; set; } = string.Empty;
    public string? DeliveryReceiptNo { get; set; }
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public SaleStatus Status { get; set; } = SaleStatus.Draft;

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }

    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
