using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.RemoteAccess;

namespace SwiftSale.Infrastructure.Services.RemoteAccess;

public class NgrokRemoteAccessService : IRemoteAccessService, IDisposable
{
    private readonly ILogger<NgrokRemoteAccessService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _settingsFilePath;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private Process? _ngrokProcess;
    private RemoteAccessStatusState _state = RemoteAccessStatusState.Disabled;
    private string? _publicUrl;
    private string? _localAddress;
    private DateTime? _startedAt;
    private string? _errorMessage;

    // Persistent storage model
    private class StoredSettings
    {
        public string NgrokPath { get; set; } = "ngrok";
        public string? Authtoken { get; set; }
        public bool AutoStart { get; set; } = false;
    }

    private StoredSettings _settings;

    public NgrokRemoteAccessService(ILogger<NgrokRemoteAccessService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };

        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var dir = Path.Combine(appData, "SwiftSale");
        Directory.CreateDirectory(dir);
        _settingsFilePath = Path.Combine(dir, "remoteaccess.json");

        _settings = LoadSettings();
    }

    public async Task<RemoteAccessStatusDto> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try {
            return GetStatusInternal();
        }
        finally {
            _semaphore.Release();
        }
    }

    public async Task<RemoteAccessSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try {
            return GetSettingsInternal();
        }
        finally {
            _semaphore.Release();
        }
    }

    public async Task<RemoteAccessSettingsDto> UpdateSettingsAsync(UpdateRemoteAccessSettingsDto dto, CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try {
            if (dto.NgrokPath != null)
            {
                _settings.NgrokPath = dto.NgrokPath.Trim();
            }

            if (dto.Authtoken != null)
            {
                var token = dto.Authtoken.Trim();
                _settings.Authtoken = string.IsNullOrEmpty(token) ? null : token;
            }

            if (dto.AutoStart.HasValue)
            {
                _settings.AutoStart = dto.AutoStart.Value;
            }

            SaveSettings();
            _logger.LogInformation("[RemoteAccess] Settings updated by administrator.");

            return GetSettingsInternal();
        }
        finally {
            _semaphore.Release();
        }
    }

    public async Task<RemoteAccessStatusDto> StartTunnelAsync(CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try {
            if (_state == RemoteAccessStatusState.Running && _ngrokProcess is { HasExited: false })
            {
                _logger.LogInformation("[RemoteAccess] Start requested but tunnel is already running.");
                return GetStatusInternal();
            }

            _state = RemoteAccessStatusState.Starting;
            _errorMessage = null;

            var (detected, path, version) = DetectNgrok(_settings.NgrokPath);
            if (!detected || string.IsNullOrEmpty(path))
            {
                _state = RemoteAccessStatusState.NgrokNotFound;
                _errorMessage = "ngrok executable was not found. Please install ngrok or configure the correct executable path.";
                _logger.LogWarning("[RemoteAccess] ngrok executable not found at path '{Path}'.", _settings.NgrokPath);
                return GetStatusInternal();
            }

            // If token is configured, configure ngrok authtoken
            if (!string.IsNullOrWhiteSpace(_settings.Authtoken))
            {
                ConfigureAuthtoken(path, _settings.Authtoken);
            }

            // Determine target local address/port
            var localPort = GetLocalServerPort();
            _localAddress = $"http://localhost:{localPort}";

            _logger.LogInformation("[RemoteAccess] Starting ngrok process targeting {LocalAddress}...", _localAddress);

            var psi = new ProcessStartInfo
            {
                FileName = path,
                Arguments = $"http {localPort}",
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };

            _ngrokProcess = new Process { StartInfo = psi };
            _ngrokProcess.EnableRaisingEvents = true;
            _ngrokProcess.Exited += (sender, args) =>
            {
                if (_state == RemoteAccessStatusState.Running || _state == RemoteAccessStatusState.Starting)
                {
                    _state = RemoteAccessStatusState.Error;
                    _errorMessage = "ngrok process stopped unexpectedly.";
                    _logger.LogWarning("[RemoteAccess] ngrok process exited unexpectedly.");
                }
            };

            _ngrokProcess.Start();

            // Query ngrok local inspection API for public URL
            string? publicUrl = null;
            for (int i = 0; i < 15; i++)
            {
                await Task.Delay(500, cancellationToken);

                if (_ngrokProcess.HasExited)
                {
                    _state = RemoteAccessStatusState.Error;
                    _errorMessage = "ngrok process failed to start or exited immediately. Check authtoken configuration.";
                    return GetStatusInternal();
                }

                publicUrl = await FetchNgrokPublicUrlAsync(cancellationToken);
                if (!string.IsNullOrEmpty(publicUrl))
                {
                    break;
                }
            }

            if (string.IsNullOrEmpty(publicUrl))
            {
                _state = RemoteAccessStatusState.Error;
                _errorMessage = "ngrok started but public URL could not be retrieved from local inspection endpoint (http://127.0.0.1:4040).";
                StopProcessInternal();
                return GetStatusInternal();
            }

            _publicUrl = publicUrl;
            _state = RemoteAccessStatusState.Running;
            _startedAt = DateTime.UtcNow;

            _logger.LogInformation("[RemoteAccess] Tunnel established. Public URL: {PublicUrl}", _publicUrl);
            return GetStatusInternal();
        }
        catch (Exception ex)
        {
            _state = RemoteAccessStatusState.Error;
            _errorMessage = $"Failed to start remote access: {ex.Message}";
            _logger.LogError(ex, "[RemoteAccess] Error starting tunnel.");
            StopProcessInternal();
            return GetStatusInternal();
        }
        finally {
            _semaphore.Release();
        }
    }

    public async Task<RemoteAccessStatusDto> StopTunnelAsync(CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try {
            StopProcessInternal();
            _state = RemoteAccessStatusState.Stopped;
            _publicUrl = null;
            _startedAt = null;
            _errorMessage = null;

            _logger.LogInformation("[RemoteAccess] Remote access tunnel stopped.");
            return GetStatusInternal();
        }
        finally {
            _semaphore.Release();
        }
    }

    private void StopProcessInternal()
    {
        if (_ngrokProcess != null)
        {
            try {
                if (!_ngrokProcess.HasExited)
                {
                    _ngrokProcess.Kill(entireProcessTree: true);
                    _ngrokProcess.WaitForExit(2000);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[RemoteAccess] Error stopping ngrok process.");
            }
            finally {
                _ngrokProcess.Dispose();
                _ngrokProcess = null;
            }
        }
    }

    private RemoteAccessStatusDto GetStatusInternal()
    {
        return new RemoteAccessStatusDto(
            _state,
            _publicUrl,
            _localAddress ?? $"http://localhost:{GetLocalServerPort()}",
            _startedAt,
            _errorMessage
        );
    }

    private RemoteAccessSettingsDto GetSettingsInternal()
    {
        var (detected, _, version) = DetectNgrok(_settings.NgrokPath);
        return new RemoteAccessSettingsDto(
            _state == RemoteAccessStatusState.Running,
            _settings.NgrokPath,
            !string.IsNullOrWhiteSpace(_settings.Authtoken),
            _settings.AutoStart,
            version,
            detected
        );
    }

    private (bool Detected, string? ExecutablePath, string? Version) DetectNgrok(string configuredPath)
    {
        string candidatePath = string.IsNullOrWhiteSpace(configuredPath) ? "ngrok" : configuredPath;

        try {
            var psi = new ProcessStartInfo
            {
                FileName = candidatePath,
                Arguments = "--version",
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };

            using var proc = Process.Start(psi);
            if (proc != null)
            {
                var output = proc.StandardOutput.ReadToEnd();
                proc.WaitForExit(3000);

                if (proc.ExitCode == 0)
                {
                    var version = output.Trim();
                    return (true, candidatePath, version);
                }
            }
        }
        catch { }

        return (false, null, null);
    }

    private void ConfigureAuthtoken(string ngrokPath, string authtoken)
    {
        try {
            var psi = new ProcessStartInfo
            {
                FileName = ngrokPath,
                Arguments = $"config add-authtoken {authtoken}",
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };

            using var proc = Process.Start(psi);
            proc?.WaitForExit(5000);
            _logger.LogInformation("[RemoteAccess] Configured ngrok authtoken successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[RemoteAccess] Error configuring ngrok authtoken.");
        }
    }

    private async Task<string?> FetchNgrokPublicUrlAsync(CancellationToken ct)
    {
        try {
            var response = await _httpClient.GetFromJsonAsync<NgrokTunnelsResponse>("http://127.0.0.1:4040/api/tunnels", ct);
            var httpsTunnel = response?.Tunnels?.FirstOrDefault(t => t.Proto == "https" || t.PublicUrl?.StartsWith("https") == true);
            var firstTunnel = httpsTunnel ?? response?.Tunnels?.FirstOrDefault();
            return firstTunnel?.PublicUrl;
        }
        catch {
            return null;
        }
    }

    private int GetLocalServerPort()
    {
        // Extracts launch port or default 5126
        var urls = _configuration["ASPNETCORE_URLS"] ?? _configuration["Urls"];
        if (!string.IsNullOrEmpty(urls))
        {
            var parts = urls.Split(';', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                if (Uri.TryCreate(part, UriKind.Absolute, out var uri))
                {
                    return uri.Port;
                }
            }
        }
        return 5126;
    }

    private StoredSettings LoadSettings()
    {
        try {
            if (File.Exists(_settingsFilePath))
            {
                var json = File.ReadAllText(_settingsFilePath);
                return JsonSerializer.Deserialize<StoredSettings>(json) ?? new StoredSettings();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[RemoteAccess] Failed to load remote access settings file.");
        }
        return new StoredSettings();
    }

    private void SaveSettings()
    {
        try {
            var json = JsonSerializer.Serialize(_settings, new JsonSerializerOptions { WriteIndented = true });
            File.ReadAllText(_settingsFilePath); // no-op check
            File.WriteAllText(_settingsFilePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RemoteAccess] Failed to save remote access settings file.");
        }
    }

    public void Dispose()
    {
        StopProcessInternal();
        _semaphore.Dispose();
        _httpClient.Dispose();
    }

    private class NgrokTunnelsResponse
    {
        [JsonPropertyName("tunnels")]
        public List<NgrokTunnel>? Tunnels { get; set; }
    }

    private class NgrokTunnel
    {
        [JsonPropertyName("public_url")]
        public string? PublicUrl { get; set; }

        [JsonPropertyName("proto")]
        public string? Proto { get; set; }
    }
}
