using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Manages stock balances, inventory adjustments, and movement audit logs.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>
    /// Retrieves inventory stock balances with optional low-stock filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryBalanceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetBalances([FromQuery] bool lowStockOnly = false, CancellationToken cancellationToken = default)
    {
        if (lowStockOnly)
        {
            var lowStock = await _inventoryService.GetLowStockProductsAsync(cancellationToken);
            return Ok(lowStock);
        }

        var balances = await _inventoryService.GetAllBalancesAsync(cancellationToken);
        return Ok(balances);
    }

    /// <summary>
    /// Executes a dual-ledger stock adjustment (AdjustmentIn or AdjustmentOut) with mandatory reason.
    /// </summary>
    [HttpPost("adjustments")]
    [ProducesResponseType(typeof(StockMovementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StockMovementDto>> AdjustStock([FromBody] CreateStockAdjustmentDto dto, CancellationToken cancellationToken = default)
    {
        var result = await _inventoryService.AdjustStockAsync(dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves stock movement audit trail.
    /// </summary>
    [HttpGet("/api/stock-movements")]
    [ProducesResponseType(typeof(List<StockMovementDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StockMovementDto>>> GetStockMovements(
        [FromQuery] Guid? productId = null, 
        [FromQuery] int limit = 50, 
        CancellationToken cancellationToken = default)
    {
        if (productId.HasValue)
        {
            var movementsByProduct = await _inventoryService.GetMovementsByProductAsync(productId.Value, cancellationToken);
            return Ok(movementsByProduct);
        }

        var movements = await _inventoryService.GetRecentMovementsAsync(limit, cancellationToken);
        return Ok(movements);
    }
}
