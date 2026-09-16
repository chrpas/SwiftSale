namespace SwiftSale.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public string UnitIdentifier { get; set; } = "PCS";
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string? UnitId { get => UnitIdentifier; set => UnitIdentifier = value ?? "PCS"; }
    public int PiecesPerBox { get; set; } = 1; // Tracks PCS/CTN packaging size
    public string? Description { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public InventoryBalance? InventoryBalance { get; set; }
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
