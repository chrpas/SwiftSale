using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Reports;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Provides reporting and analytical endpoints for sales performance, inventory valuation, and gross margins.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Generates sales report summary and daily trend breakdown.
    /// </summary>
    [HttpGet("sales")]
    [ProducesResponseType(typeof(SalesReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SalesReportDto>> GetSalesReport(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var report = await _reportService.GetSalesReportAsync(fromDate, toDate, cancellationToken);
        return Ok(report);
    }

    /// <summary>
    /// Generates current inventory valuation and stock levels report.
    /// </summary>
    [HttpGet("inventory")]
    [ProducesResponseType(typeof(InventoryReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryReportDto>> GetInventoryReport(CancellationToken cancellationToken = default)
    {
        var report = await _reportService.GetInventoryReportAsync(cancellationToken);
        return Ok(report);
    }

    /// <summary>
    /// Generates profit report containing revenue, cost of goods sold, gross profit, and margin percentage.
    /// </summary>
    [HttpGet("profit")]
    [ProducesResponseType(typeof(ProfitReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProfitReportDto>> GetProfitReport(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var report = await _reportService.GetProfitReportAsync(fromDate, toDate, cancellationToken);
        return Ok(report);
    }
}
