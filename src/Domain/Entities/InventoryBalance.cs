using System.ComponentModel.DataAnnotations.Schema;

namespace SwiftSale.Domain.Entities;

public class InventoryBalance
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public decimal QuantityOnHand { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AverageCost { get; set; }

    // Calculated helper property for available quantity (not mapped in DB)
    [NotMapped]
    public decimal QuantityAvailable => QuantityOnHand - ReservedQuantity;
}
