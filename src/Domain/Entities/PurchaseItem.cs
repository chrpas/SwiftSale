namespace SwiftSale.Domain.Entities;

public class PurchaseItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
}
