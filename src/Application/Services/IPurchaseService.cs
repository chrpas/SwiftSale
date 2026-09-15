using SwiftSale.Application.DTOs.Purchases;

namespace SwiftSale.Application.Services;

public interface IPurchaseService
{
    Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto, CancellationToken cancellationToken = default);
    Task<PurchaseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<PurchaseDto>> GetPurchasesAsync(Guid? supplierId = null, CancellationToken cancellationToken = default);
}
