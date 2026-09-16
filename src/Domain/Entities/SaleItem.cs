namespace SwiftSale.Domain.Entities;

public class SaleItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SaleId { get; set; }
    public Sale? Sale { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public string UnitSold { get; set; } = "PCS"; // "PCS" or "BOX"
    public decimal QuantitySold { get; set; }      // E.g., 2 (boxes) or 5 (pieces)
    public decimal BaseQuantityDeducted { get; set; } // E.g., 2 boxes * 10 = 20 pieces

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}
