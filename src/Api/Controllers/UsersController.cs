using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.Common.Security;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IAppDbContext _db;

    public UsersController(IAppDbContext db)
    {
        _db = db;
    }

    /// <summary>Gets all users. Admin only.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto(u.Id, u.Username, u.FullName, u.Role, u.IsActive, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    /// <summary>Creates a new user. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var exists = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (exists)
            return Conflict(new { message = $"Username '{request.Username}' is already taken." });

        var user = new User
        {
            Username = request.Username.Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var dto = new UserDto(user.Id, user.Username, user.FullName, user.Role, user.IsActive, user.CreatedAt);
        return CreatedAtAction(nameof(GetAll), dto);
    }

    /// <summary>Updates a user's active status or role. Admin only.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.FullName = request.FullName?.Trim() ?? user.FullName;
        user.Role = request.Role ?? user.Role;
        user.IsActive = request.IsActive ?? user.IsActive;

        await _db.SaveChangesAsync();
        return Ok(new UserDto(user.Id, user.Username, user.FullName, user.Role, user.IsActive, user.CreatedAt));
    }

    /// <summary>Changes a user's password. Admin only.</summary>
    [HttpPost("{id:guid}/reset-password")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record UserDto(Guid Id, string Username, string FullName, string Role, bool IsActive, DateTime CreatedAt);
public record CreateUserRequest(string Username, string FullName, string Password, string Role);
public record UpdateUserRequest(string? FullName, string? Role, bool? IsActive);
public record ResetPasswordRequest(string NewPassword);
