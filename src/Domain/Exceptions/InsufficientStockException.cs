namespace SwiftSale.Domain.Exceptions;

public class InsufficientStockException : Exception
{
    public Guid ProductId { get; }
    public string SKU { get; }
    public decimal RequestedQuantity { get; }
    public decimal AvailableQuantity { get; }

    public InsufficientStockException(Guid productId, string sku, decimal requestedQuantity, decimal availableQuantity)
        : base($"Insufficient stock for product '{sku}' (ID: {productId}). Requested: {requestedQuantity:N2}, Available: {availableQuantity:N2}.")
    {
        ProductId = productId;
        SKU = sku;
        RequestedQuantity = requestedQuantity;
        AvailableQuantity = availableQuantity;
    }
}
