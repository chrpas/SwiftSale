using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Api.Controllers;

/// <summary>
/// Manages product categories.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    private readonly IAppDbContext _context;

    public CategoriesController(IAppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retrieves all product categories.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CategoryDto>>> GetAll(CancellationToken cancellationToken = default)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description))
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    /// <summary>
    /// Retrieves a single product category by its unique identifier.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description))
            .FirstOrDefaultAsync(cancellationToken);

        if (category is null) return NotFound();

        return Ok(category);
    }

    /// <summary>
    /// Creates a new product category.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        var trimmedName = request.Name.Trim();
        var exists = await _context.Categories.AnyAsync(
            c => c.Name.ToLower() == trimmedName.ToLower(), 
            cancellationToken);

        if (exists)
        {
            return BadRequest(new { message = $"Category '{trimmedName}' already exists." });
        }

        var category = new Category
        {
            Name = trimmedName,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CategoryDto(category.Id, category.Name, category.Description);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, dto);
    }

    /// <summary>
    /// Updates an existing product category.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        var category = await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        if (category is null) return NotFound();

        var trimmedName = request.Name.Trim();
        var duplicate = await _context.Categories.AnyAsync(
            c => c.Id != id && c.Name.ToLower() == trimmedName.ToLower(), 
            cancellationToken);

        if (duplicate)
        {
            return BadRequest(new { message = $"Another category named '{trimmedName}' already exists." });
        }

        category.Name = trimmedName;
        category.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CategoryDto(category.Id, category.Name, category.Description);
        return Ok(dto);
    }

    /// <summary>
    /// Deletes a product category if no products are assigned to it.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        if (category is null) return NotFound();

        var productCount = await _context.Products.CountAsync(p => p.CategoryId == id, cancellationToken);
        if (productCount > 0)
        {
            return BadRequest(new { message = $"Cannot delete category '{category.Name}' because it is currently assigned to {productCount} product(s)." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public record CategoryDto(Guid Id, string Name, string? Description);
public record CreateCategoryRequest(string Name, string? Description);
