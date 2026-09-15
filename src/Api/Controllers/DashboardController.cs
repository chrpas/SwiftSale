using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Dashboard;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Provides dashboard KPI metrics and business performance indicators.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Retrieves current business metrics including today's sales, monthly revenue, profit, valuation, and low stock counts.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetrics(CancellationToken cancellationToken = default)
    {
        var metrics = await _dashboardService.GetDashboardMetricsAsync(cancellationToken);
        return Ok(metrics);
    }
}
