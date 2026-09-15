using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SwiftSale.Application.Common.Interfaces;

namespace SwiftSale.Infrastructure.Services.RemoteAccess;

public class RemoteAccessBackgroundService : BackgroundService
{
    private readonly IRemoteAccessService _remoteAccessService;
    private readonly ILogger<RemoteAccessBackgroundService> _logger;

    public RemoteAccessBackgroundService(
        IRemoteAccessService remoteAccessService,
        ILogger<RemoteAccessBackgroundService> logger)
    {
        _remoteAccessService = remoteAccessService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // Give API server a brief moment to initialize its HTTP listeners
            await Task.Delay(2000, stoppingToken);

            var settings = await _remoteAccessService.GetSettingsAsync(stoppingToken);
            if (settings.AutoStart)
            {
                _logger.LogInformation("[RemoteAccess] AutoStart is enabled. Attempting to start ngrok remote access tunnel...");
                await _remoteAccessService.StartTunnelAsync(stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RemoteAccess] Error executing auto-start for remote access.");
        }
    }
}
