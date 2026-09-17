using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Dashboard;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IAppDbContext _db;

    public DashboardService(IAppDbContext db)
    {
        _db = db;
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
            var avgCost = i.Product?.InventoryBalance?.AverageCost ?? i.Product?.CostPrice ?? 0m;
            var baseQty = i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity;
            return baseQty * avgCost;
        });
        decimal todayGrossProfit = todaySales - todayCost;

        // 2. Month's Revenue & Cost
        decimal monthSales = sales.Sum(s => s.Total);
        decimal monthCost = sales.SelectMany(s => s.Items).Sum(i =>
        {
            var avgCost = i.Product?.InventoryBalance?.AverageCost ?? i.Product?.CostPrice ?? 0m;
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
            var avgCost = p.InventoryBalance?.AverageCost ?? p.CostPrice;
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
            lowStockList
        );
    }
}
