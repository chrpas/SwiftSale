using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Sales;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Manages point of sale checkout, transactions, payments, and returns.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    /// <summary>
    /// Retrieves sales history with optional date range and customer filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SaleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SaleDto>>> GetSales(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] Guid? customerId = null,
        CancellationToken cancellationToken = default)
    {
        var sales = await _saleService.GetSalesAsync(fromDate, toDate, customerId, cancellationToken);
        return Ok(sales);
    }

    /// <summary>
    /// Executes a sale checkout, enforcing stock availability, updating balances, and generating an invoice number.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> Create([FromBody] CreateSaleDto dto, CancellationToken cancellationToken = default)
    {
        var sale = await _saleService.CreateSaleAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
    }

    /// <summary>
    /// Retrieves a sale by ID including line items, profit calculations, and payments.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var sale = await _saleService.GetByIdAsync(id, cancellationToken);
        return Ok(sale);
    }

    /// <summary>
    /// Records an additional payment toward a sale.
    /// </summary>
    [HttpPost("{id:guid}/payments")]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> AddPayment(Guid id, [FromBody] CreatePaymentDto dto, CancellationToken cancellationToken = default)
    {
        var sale = await _saleService.AddPaymentAsync(id, dto, cancellationToken);
        return Ok(sale);
    }

    /// <summary>
    /// Voids a completed sale, restoring inventory balance and recording a SaleVoidReturn movement.
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> Void(Guid id, [FromBody] VoidSaleRequest request, CancellationToken cancellationToken = default)
    {
        var voidDto = new VoidSaleDto(id, request.Reason);
        var voided = await _saleService.VoidSaleAsync(voidDto, cancellationToken);
        return Ok(voided);
    }
}

public record VoidSaleRequest(string Reason);
