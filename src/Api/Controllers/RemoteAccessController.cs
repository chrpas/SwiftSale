using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.RemoteAccess;

namespace SwiftSale.Api.Controllers;

[ApiController]
[Route("api/remote-access")]
[Authorize(Roles = "Admin")]
public class RemoteAccessController : ControllerBase
{
    private readonly IRemoteAccessService _remoteAccessService;

    public RemoteAccessController(IRemoteAccessService remoteAccessService)
    {
        _remoteAccessService = remoteAccessService;
    }

    /// <summary>Gets current remote access tunnel status. Admin only.</summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(RemoteAccessStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var status = await _remoteAccessService.GetStatusAsync(cancellationToken);
        return Ok(status);
    }

    /// <summary>Gets remote access settings. Admin only.</summary>
    [HttpGet("settings")]
    [ProducesResponseType(typeof(RemoteAccessSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var settings = await _remoteAccessService.GetSettingsAsync(cancellationToken);
        return Ok(settings);
    }

    /// <summary>Updates remote access configuration settings. Admin only.</summary>
    [HttpPut("settings")]
    [ProducesResponseType(typeof(RemoteAccessSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSettings(
        [FromBody] UpdateRemoteAccessSettingsDto request,
        CancellationToken cancellationToken)
    {
        var settings = await _remoteAccessService.UpdateSettingsAsync(request, cancellationToken);
        return Ok(settings);
    }

    /// <summary>Starts ngrok remote access tunnel. Admin only.</summary>
    [HttpPost("start")]
    [ProducesResponseType(typeof(RemoteAccessStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartTunnel(CancellationToken cancellationToken)
    {
        var status = await _remoteAccessService.StartTunnelAsync(cancellationToken);
        return Ok(status);
    }

    /// <summary>Stops ngrok remote access tunnel. Admin only.</summary>
    [HttpPost("stop")]
    [ProducesResponseType(typeof(RemoteAccessStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> StopTunnel(CancellationToken cancellationToken)
    {
        var status = await _remoteAccessService.StopTunnelAsync(cancellationToken);
        return Ok(status);
    }
}
