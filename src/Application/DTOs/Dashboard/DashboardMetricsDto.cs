using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Application.DTOs.Sales;

namespace SwiftSale.Application.DTOs.Dashboard;

public record DashboardMetricsDto(
    decimal TodaySales,
    int TodaySalesCount,
    decimal TodayGrossProfit,
    decimal MonthSales,
    int MonthSalesCount,
    decimal MonthGrossProfit,
    decimal MonthGrossMarginPercent,
    decimal TotalInventoryValuation,
    int TotalProductsCount,
    int LowStockCount,
    List<SaleDto>? RecentSales = null,
    List<LowStockProductDto>? LowStockProducts = null,
    List<DashboardNotificationDto>? Notifications = null
);
