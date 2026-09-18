namespace SwiftSale.Application.DTOs.Dashboard;

public record DashboardNotificationDto(
    string Id,
    string Type,
    string Title,
    string Message,
    string TimeAgo,
    DateTime Timestamp,
    string DotColor,
    string? TargetUrl = null
);
