using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitsController : ControllerBase
{
    private readonly IAppDbContext _db;

    public UnitsController(IAppDbContext db)
    {
        _db = db;
    }

    /// <summary>Gets all units of measure.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UnitOfMeasure>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var units = await _db.UnitsOfMeasure.OrderBy(u => u.Name).ToListAsync();
        return Ok(units);
    }

    /// <summary>Creates a unit of measure. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UnitOfMeasure), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateUnitRequest request)
    {
        var unit = new UnitOfMeasure
        {
            Name = request.Name.Trim(),
            Abbreviation = request.Abbreviation.Trim()
        };
        _db.UnitsOfMeasure.Add(unit);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), unit);
    }

    /// <summary>Updates a unit of measure. Admin only.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UnitOfMeasure), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateUnitRequest request)
    {
        var unit = await _db.UnitsOfMeasure.FindAsync(id);
        if (unit is null) return NotFound();
        unit.Name = request.Name.Trim();
        unit.Abbreviation = request.Abbreviation.Trim();
        await _db.SaveChangesAsync();
        return Ok(unit);
    }

    /// <summary>Deletes a unit of measure. Admin only.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var unit = await _db.UnitsOfMeasure.FindAsync(id);
        if (unit is null) return NotFound();
        _db.UnitsOfMeasure.Remove(unit);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateUnitRequest(string Name, string Abbreviation);
