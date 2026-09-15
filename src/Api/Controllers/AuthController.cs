using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.Common.Security;

namespace SwiftSale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(IAppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    /// <summary>Authenticates a user and returns a JWT token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user is null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var token = _tokenService.GenerateToken(user);
        return Ok(new LoginResponse(
            token,
            user.Id,
            user.Username,
            user.FullName,
            user.Role
        ));
    }
}

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, Guid UserId, string Username, string FullName, string Role);
