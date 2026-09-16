using SwiftSale.Application.DTOs.Products;

namespace SwiftSale.Application.Services;

public interface IProductService
{
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> GetAllAsync(bool? activeOnly = null, Guid? categoryId = null, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
}
