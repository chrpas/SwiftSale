using SwiftSale.Application.DTOs.RemoteAccess;

namespace SwiftSale.Application.Common.Interfaces;

public interface IRemoteAccessService
{
    Task<RemoteAccessStatusDto> GetStatusAsync(CancellationToken cancellationToken = default);
    Task<RemoteAccessSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task<RemoteAccessSettingsDto> UpdateSettingsAsync(UpdateRemoteAccessSettingsDto dto, CancellationToken cancellationToken = default);
    Task<RemoteAccessStatusDto> StartTunnelAsync(CancellationToken cancellationToken = default);
    Task<RemoteAccessStatusDto> StopTunnelAsync(CancellationToken cancellationToken = default);
}
