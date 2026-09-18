using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Dashboard;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IAppDbContext _db;
    private readonly IRemoteAccessService? _remoteAccessService;

    public DashboardService(IAppDbContext db, IRemoteAccessService? remoteAccessService = null)
    {
        _db = db;
        _remoteAccessService = remoteAccessService;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var startOfToday = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Active Completed Sales for Today and Month
        var sales = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .Where(s => s.Status == SaleStatus.Completed && s.SaleDate >= startOfMonth)
            .ToListAsync(cancellationToken);

        var todaySalesList = sales.Where(s => s.SaleDate >= startOfToday).ToList();

        // 1. Today's Revenue & Cost
        decimal todaySales = todaySalesList.Sum(s => s.Total);
        decimal todayCost = todaySalesList.SelectMany(s => s.Items).Sum(i =>
        {
            var avgCost = (i.Product?.InventoryBalance != null && i.Product.InventoryBalance.AverageCost > 0m)
                ? i.Product.InventoryBalance.AverageCost
                : (i.Product?.CostPrice ?? 0m);
            var baseQty = i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity;
            return baseQty * avgCost;
        });
        decimal todayGrossProfit = todaySales - todayCost;

        // 2. Month's Revenue & Cost
        decimal monthSales = sales.Sum(s => s.Total);
        decimal monthCost = sales.SelectMany(s => s.Items).Sum(i =>
        {
            var avgCost = (i.Product?.InventoryBalance != null && i.Product.InventoryBalance.AverageCost > 0m)
                ? i.Product.InventoryBalance.AverageCost
                : (i.Product?.CostPrice ?? 0m);
            var baseQty = i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity;
            return baseQty * avgCost;
        });
        decimal monthGrossProfit = monthSales - monthCost;
        decimal monthMargin = monthSales > 0 ? Math.Round((monthGrossProfit / monthSales) * 100m, 2) : 0m;

        // 3. Inventory Valuation & Low Stock Counts
        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.InventoryBalance)
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        decimal totalValuation = products.Sum(p =>
        {
            var onHand = p.InventoryBalance?.QuantityOnHand ?? 0m;
            var avgCost = (p.InventoryBalance != null && p.InventoryBalance.AverageCost > 0m) ? p.InventoryBalance.AverageCost : p.CostPrice;
            return onHand * avgCost;
        });

        int totalCount = products.Count;
        int lowStockCount = products.Count(p => 
            p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand > 0m && p.InventoryBalance.QuantityOnHand <= p.ReorderLevel);

        var recentSalesList = sales
            .OrderByDescending(s => s.SaleDate)
            .Take(10)
            .Select(SaleService.MapToDto)
            .ToList();

        var lowStockList = products
            .Where(p => p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand > 0m && p.InventoryBalance.QuantityOnHand <= p.ReorderLevel)
            .Select(p => new SwiftSale.Application.DTOs.Inventory.LowStockProductDto(
                p.Id,
                p.SKU,
                p.Name,
                p.Category?.Name,
                p.InventoryBalance?.QuantityOnHand ?? 0m,
                p.ReorderLevel,
                p.ReorderLevel - (p.InventoryBalance?.QuantityOnHand ?? 0m)
            )).ToList();

        // 4. Dynamic Notifications Feed (Zero Database Bloat - aggregated on-the-fly)
        var notifications = new List<DashboardNotificationDto>();

        // Event Type 1: Remote Access Tunnel is running
        if (_remoteAccessService != null)
        {
            try
            {
                var tunnelStatus = await _remoteAccessService.GetStatusAsync(cancellationToken);
                if (tunnelStatus.State == SwiftSale.Application.DTOs.RemoteAccess.RemoteAccessStatusState.Running)
                {
                    var startedTime = tunnelStatus.StartedAt ?? now;
                    notifications.Add(new DashboardNotificationDto(
                        "tunnel-running",
                        "RemoteAccess",
                        "Remote Tunnel Active",
                        string.IsNullOrWhiteSpace(tunnelStatus.PublicUrl)
                            ? "Remote Access Tunnel is active and running."
                            : $"Remote Access Tunnel is live at {tunnelStatus.PublicUrl}",
                        FormatTimeAgo(startedTime),
                        startedTime,
                        "#8B5CF6", // Purple
                        "/settings"
                    ));
                }
            }
            catch
            {
                // Fail gracefully if remote access service is not configured
            }
        }

        // Event Type 2: Orders with Pending Clearance (Actionable check payments)
        var pendingSales = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Where(s => s.Status == SaleStatus.PendingClearance)
            .OrderByDescending(s => s.SaleDate)
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var ps in pendingSales)
        {
            var cust = ps.Customer != null ? ps.Customer.Name : "Walk-in";
            notifications.Add(new DashboardNotificationDto(
                $"pending-{ps.Id}",
                "PendingClearance",
                "Pending Clearance",
                $"Order {ps.InvoiceNo} ({cust}) awaiting check clearance (₱{ps.Total:N2})",
                FormatTimeAgo(ps.SaleDate),
                ps.SaleDate,
                "#F59E0B", // Amber
                "/sales"
            ));
        }

        // Event Type 3: Low Threshold Items (Products reached/below reorder level)
        var lowStockAlerts = products
            .Where(p => p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand <= p.ReorderLevel)
            .Take(3)
            .ToList();

        foreach (var lp in lowStockAlerts)
        {
            var onHand = lp.InventoryBalance?.QuantityOnHand ?? 0m;
            notifications.Add(new DashboardNotificationDto(
                $"low-stock-{lp.Id}",
                "LowStock",
                "Low Stock Alert",
                $"Stock alert: {lp.Name} reached reorder level ({onHand:N0} remaining, reorder at {lp.ReorderLevel:N0})",
                FormatTimeAgo(now.AddMinutes(-30)),
                now.AddMinutes(-30),
                "#EF4444", // Rose/Red
                "/inventory"
            ));
        }

        // Event Type 4: Order status completed
        var recentCompletedSales = sales
            .OrderByDescending(s => s.SaleDate)
            .Take(3)
            .ToList();

        foreach (var cs in recentCompletedSales)
        {
            var cust = cs.Customer != null ? cs.Customer.Name : "Walk-in";
            notifications.Add(new DashboardNotificationDto(
                $"completed-{cs.Id}",
                "OrderCompleted",
                "Order Completed",
                $"Order {cs.InvoiceNo} completed for {cust} (₱{cs.Total:N2})",
                FormatTimeAgo(cs.SaleDate),
                cs.SaleDate,
                "#10B981", // Green
                "/sales"
            ));
        }

        // Event Type 5: New order created (recent drafts or non-pending sales)
        var recentDraftSales = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Where(s => s.Status == SaleStatus.Draft)
            .OrderByDescending(s => s.SaleDate)
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var ds in recentDraftSales)
        {
            var cust = ds.Customer != null ? ds.Customer.Name : "Walk-in";
            notifications.Add(new DashboardNotificationDto(
                $"draft-{ds.Id}",
                "NewOrder",
                "New Order Created",
                $"New order {ds.InvoiceNo} created for {cust} (₱{ds.Total:N2})",
                FormatTimeAgo(ds.SaleDate),
                ds.SaleDate,
                "#0EA5E9", // Cyan
                "/sales"
            ));
        }

        // Event Type 6: New Customer added
        var recentCustomers = await _db.Customers
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var rc in recentCustomers)
        {
            var custDate = rc.CreatedAt == default ? now.AddHours(-1) : rc.CreatedAt;
            notifications.Add(new DashboardNotificationDto(
                $"customer-{rc.Id}",
                "NewCustomer",
                "New Customer Added",
                $"New customer registered: {rc.Name}",
                FormatTimeAgo(custDate),
                custDate,
                "#3B82F6", // Blue
                "/customers"
            ));
        }

        // Prioritize actionable/live items (Remote Access, Pending Clearance) then sort by Timestamp descending, top 5
        var finalNotifications = notifications
            .OrderByDescending(n => n.Type == "RemoteAccess" ? 2 : n.Type == "PendingClearance" ? 1 : 0)
            .ThenByDescending(n => n.Timestamp)
            .Take(5)
            .ToList();

        return new DashboardMetricsDto(
            todaySales,
            todaySalesList.Count,
            todayGrossProfit,
            monthSales,
            sales.Count,
            monthGrossProfit,
            monthMargin,
            totalValuation,
            totalCount,
            lowStockCount,
            recentSalesList,
            lowStockList,
            finalNotifications
        );
    }

    private static string FormatTimeAgo(DateTime timestamp)
    {
        var span = DateTime.UtcNow - timestamp;
        if (span.TotalSeconds < 60) return "Just now";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
        if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
        return timestamp.ToString("MMM d");
    }
}
