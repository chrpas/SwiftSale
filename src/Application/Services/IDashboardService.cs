using SwiftSale.Application.DTOs.Dashboard;

namespace SwiftSale.Application.Services;

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync(CancellationToken cancellationToken = default);
}
