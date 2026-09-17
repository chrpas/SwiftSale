namespace SwiftSale.Domain.Entities;

/// <summary>
/// Generic key-value store for system-wide application settings persisted in the database.
/// Used for settings that must survive re-deployments (e.g. Remote Access / ngrok configuration).
/// </summary>
public class AppSetting
{
    public int Id { get; set; }

    /// <summary>Unique setting key, e.g. "RemoteAccess:NgrokPath".</summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>Setting value stored as a string. Null means the setting is explicitly cleared.</summary>
    public string? Value { get; set; }

    /// <summary>UTC timestamp of the last write.</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
