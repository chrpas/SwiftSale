using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.DTOs.Products;
using SwiftSale.Application.Services;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Manages product catalog, pricing, and inventory specifications.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Retrieves all products with optional filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductDto>>> GetAll(
        [FromQuery] bool? activeOnly = null, 
        [FromQuery] Guid? categoryId = null, 
        CancellationToken cancellationToken = default)
    {
        var products = await _productService.GetAllAsync(activeOnly, categoryId, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Retrieves a single product by its unique identifier.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        return Ok(product);
    }

    /// <summary>
    /// Creates a new product and initializes inventory balance. Admin only.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var created = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates product specifications, name, and category. Admin only.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        var dto = new UpdateProductDto(
            request.Name,
            request.CategoryId,
            request.UnitId ?? existing.UnitId,
            request.CostPrice ?? existing.CostPrice,
            request.SellingPrice ?? existing.SellingPrice,
            request.ReorderLevel ?? existing.ReorderLevel,
            request.IsActive ?? existing.IsActive
        );

        var updated = await _productService.UpdateAsync(id, dto, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Soft deletes (discontinues) a product. Admin only.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        await _productService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Reactivates a discontinued product. Admin only.
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken = default)
    {
        await _productService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }
}

public record UpdateProductRequest(
    string Name,
    Guid CategoryId,
    string? UnitId = null,
    decimal? CostPrice = null,
    decimal? SellingPrice = null,
    int? ReorderLevel = null,
    bool? IsActive = null
);
