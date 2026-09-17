using SwiftSale.Application.DTOs.Sales;

namespace SwiftSale.Application.Services;

public interface ISaleService
{
    Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default);
    Task<SaleDto> VoidSaleAsync(VoidSaleDto dto, CancellationToken cancellationToken = default);
    Task<SaleDto> AddPaymentAsync(Guid saleId, CreatePaymentDto dto, CancellationToken cancellationToken = default);
    Task<SaleDto> ClearCheckPaymentAsync(Guid paymentId, CancellationToken cancellationToken = default);
    Task<SaleDto> DishonorCheckAndReturnSaleAsync(Guid saleId, Guid paymentId, string reason, CancellationToken cancellationToken = default);
    Task<SaleDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SaleDto?> GetByInvoiceNoAsync(string invoiceNo, CancellationToken cancellationToken = default);
    Task<List<SaleDto>> GetSalesAsync(DateTime? fromDate = null, DateTime? toDate = null, Guid? customerId = null, CancellationToken cancellationToken = default);
}
