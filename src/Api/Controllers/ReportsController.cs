using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Reports;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Provides reporting, business analytics, and printable PDF document exports.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly IReportingService _reportingService;
    private readonly IReportService _legacyReportService;

    public ReportsController(IReportingService reportingService, IReportService legacyReportService)
    {
        _reportingService = reportingService;
        _legacyReportService = legacyReportService;
    }

    /// <summary>
    /// Retrieves executive KPI overview (Total Revenue, Orders, COGS, Gross Profit, Gross Margin %, Inventory Valuation, and Health).
    /// </summary>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(ReportOverviewDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReportOverviewDto>> GetOverview(
        [FromQuery] ReportFilterParams filters,
        CancellationToken cancellationToken = default)
    {
        var overview = await _reportingService.GetOverviewAsync(filters, cancellationToken);
        return Ok(overview);
    }

    /// <summary>
    /// Retrieves daily time-series array of sales revenue and gross profit.
    /// </summary>
    [HttpGet("sales-trend")]
    [ProducesResponseType(typeof(List<SalesTrendDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SalesTrendDto>>> GetSalesTrend(
        [FromQuery] ReportFilterParams filters,
        CancellationToken cancellationToken = default)
    {
        var trend = await _reportingService.GetSalesTrendAsync(filters, cancellationToken);
        return Ok(trend);
    }

    /// <summary>
    /// Retrieves ranked list of top-selling products by gross revenue with realized profit and margin percentage.
    /// </summary>
    [HttpGet("top-products")]
    [ProducesResponseType(typeof(List<TopProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TopProductDto>>> GetTopProducts(
        [FromQuery] ReportFilterParams filters,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        var topProducts = await _reportingService.GetTopProductsAsync(filters, limit, cancellationToken);
        return Ok(topProducts);
    }

    /// <summary>
    /// Retrieves products with capital tied up in stock but zero or sluggish velocity in the period.
    /// </summary>
    [HttpGet("slow-moving-products")]
    [ProducesResponseType(typeof(List<SlowMovingProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SlowMovingProductDto>>> GetSlowMovingProducts(
        [FromQuery] ReportFilterParams filters,
        CancellationToken cancellationToken = default)
    {
        var slowMoving = await _reportingService.GetSlowMovingProductsAsync(filters, cancellationToken);
        return Ok(slowMoving);
    }

    /// <summary>
    /// Generates and streams a 3-page printable PDF operational report document (Executive Overview, Top Products, Slow-Moving Inventory).
    /// </summary>
    [HttpGet("export/pdf")]
    [Produces("application/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportPdfReport(
        [FromQuery] ReportFilterParams filters,
        CancellationToken cancellationToken = default)
    {
        var pdfBytes = await _reportingService.GeneratePdfReportAsync(filters, cancellationToken);
        var fileName = $"SwiftSale_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    #region Legacy Endpoints (For Backwards Compatibility)

    /// <summary>
    /// Generates legacy sales report summary and daily trend breakdown.
    /// </summary>
    [HttpGet("sales")]
    [ProducesResponseType(typeof(SalesReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SalesReportDto>> GetSalesReport(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var report = await _legacyReportService.GetSalesReportAsync(fromDate, toDate, cancellationToken);
        return Ok(report);
    }

    /// <summary>
    /// Generates legacy current inventory valuation and stock levels report.
    /// </summary>
    [HttpGet("inventory")]
    [ProducesResponseType(typeof(InventoryReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryReportDto>> GetInventoryReport(CancellationToken cancellationToken = default)
    {
        var report = await _legacyReportService.GetInventoryReportAsync(cancellationToken);
        return Ok(report);
    }

    /// <summary>
    /// Generates legacy profit report containing revenue, cost of goods sold, gross profit, and margin percentage.
    /// </summary>
    [HttpGet("profit")]
    [ProducesResponseType(typeof(ProfitReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProfitReportDto>> GetProfitReport(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var report = await _legacyReportService.GetProfitReportAsync(fromDate, toDate, cancellationToken);
        return Ok(report);
    }

    #endregion
}
