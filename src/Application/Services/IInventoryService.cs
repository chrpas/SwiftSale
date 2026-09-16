using SwiftSale.Application.DTOs.Inventory;

namespace SwiftSale.Application.Services;

public interface IInventoryService
{
    Task<StockMovementDto> AdjustStockAsync(CreateStockAdjustmentDto dto, CancellationToken cancellationToken = default);
    Task<List<StockMovementDto>> GetMovementsByProductAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<List<StockMovementDto>> GetRecentMovementsAsync(int limit = 50, CancellationToken cancellationToken = default);
    Task<List<LowStockProductDto>> GetLowStockProductsAsync(CancellationToken cancellationToken = default);
    Task<InventoryBalanceDto> GetInventoryBalanceAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<List<InventoryBalanceDto>> GetAllBalancesAsync(bool? activeOnly = null, CancellationToken cancellationToken = default);
}
