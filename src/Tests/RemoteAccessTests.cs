using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using SwiftSale.Application.DTOs.RemoteAccess;
using SwiftSale.Infrastructure.Services.RemoteAccess;
using Xunit;

namespace SwiftSale.Tests;

public class RemoteAccessTests
{
    [Fact]
    public async Task GetStatus_InitialState_ShouldBeDisabledOrStopped()
    {
        var config = new ConfigurationBuilder().Build();
        using var service = new NgrokRemoteAccessService(NullLogger<NgrokRemoteAccessService>.Instance, config);

        var status = await service.GetStatusAsync();

        Assert.NotNull(status);
        Assert.True(status.State == RemoteAccessStatusState.Disabled || status.State == RemoteAccessStatusState.Stopped);
        Assert.Null(status.PublicUrl);
    }

    [Fact]
    public async Task GetSettings_Initial_ShouldReflectDefaultOptions()
    {
        var config = new ConfigurationBuilder().Build();
        using var service = new NgrokRemoteAccessService(NullLogger<NgrokRemoteAccessService>.Instance, config);

        var settings = await service.GetSettingsAsync();

        Assert.NotNull(settings);
        Assert.False(settings.Enabled);
    }

    [Fact]
    public async Task UpdateSettings_ShouldSaveAndReturnNewValues()
    {
        var config = new ConfigurationBuilder().Build();
        using var service = new NgrokRemoteAccessService(NullLogger<NgrokRemoteAccessService>.Instance, config);

        var updateDto = new UpdateRemoteAccessSettingsDto(
            NgrokPath: "ngrok",
            Authtoken: "test_authtoken_12345",
            AutoStart: true
        );

        var updated = await service.UpdateSettingsAsync(updateDto);

        Assert.NotNull(updated);
        Assert.Equal("ngrok", updated.NgrokPath);
        Assert.True(updated.HasAuthtoken);
        Assert.True(updated.AutoStart);
    }
}
