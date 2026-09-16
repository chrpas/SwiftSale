using SwiftSale.Application.DTOs.Reports;

namespace SwiftSale.Application.Services;

public interface IReportingService
{
    Task<ReportOverviewDto> GetOverviewAsync(ReportFilterParams filters, CancellationToken cancellationToken = default);
    Task<List<SalesTrendDto>> GetSalesTrendAsync(ReportFilterParams filters, CancellationToken cancellationToken = default);
    Task<List<TopProductDto>> GetTopProductsAsync(ReportFilterParams filters, int limit = 20, CancellationToken cancellationToken = default);
    Task<List<SlowMovingProductDto>> GetSlowMovingProductsAsync(ReportFilterParams filters, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfReportAsync(ReportFilterParams filters, CancellationToken cancellationToken = default);
}
