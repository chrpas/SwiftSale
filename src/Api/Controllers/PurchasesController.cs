using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Purchases;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Manages supplier purchase orders and inbound inventory receiving.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchaseService;

    public PurchasesController(IPurchaseService purchaseService)
    {
        _purchaseService = purchaseService;
    }

    /// <summary>
    /// Retrieves purchase orders with optional supplier filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PurchaseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PurchaseDto>>> GetPurchases(
        [FromQuery] Guid? supplierId = null, 
        CancellationToken cancellationToken = default)
    {
        var purchases = await _purchaseService.GetPurchasesAsync(supplierId, cancellationToken);
        return Ok(purchases);
    }

    /// <summary>
    /// Creates and processes a completed purchase order, receiving inventory and recalculating average costs.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PurchaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseDto>> Create([FromBody] CreatePurchaseDto dto, CancellationToken cancellationToken = default)
    {
        var result = await _purchaseService.CreatePurchaseAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Retrieves a single purchase order by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PurchaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var purchase = await _purchaseService.GetByIdAsync(id, cancellationToken);
        return Ok(purchase);
    }
}
