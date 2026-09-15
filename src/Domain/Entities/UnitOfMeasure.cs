namespace SwiftSale.Domain.Entities;

public class UnitOfMeasure
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty; // e.g. "Pcs", "Bag", "Box", "Kg", "L", "Tin"
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
