using SwiftSale.Domain.Enums;

namespace SwiftSale.Domain.Entities;

public class Purchase
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public string ReferenceNo { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Draft;
    public decimal TotalCost { get; set; }

    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();
}
