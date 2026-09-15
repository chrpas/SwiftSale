using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Reports;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.Services;

public interface IReportService
{
    Task<SalesReportDto> GetSalesReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);
    Task<InventoryReportDto> GetInventoryReportAsync(CancellationToken cancellationToken = default);
    Task<ProfitReportDto> GetProfitReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);
}

public class ReportService : IReportService
{
    private readonly IAppDbContext _db;

    public ReportService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<SalesReportDto> GetSalesReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var start = fromDate ?? DateTime.UtcNow.AddDays(-30);
        var end = toDate ?? DateTime.UtcNow;

        var sales = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .Where(s => s.SaleDate >= start && s.SaleDate <= end)
            .ToListAsync(cancellationToken);

        var completedSales = sales.Where(s => s.Status == SaleStatus.Completed).ToList();
        var voidedCount = sales.Count(s => s.Status == SaleStatus.Voided);

        var totalSubtotal = completedSales.Sum(s => s.Subtotal);
        var totalDiscount = completedSales.Sum(s => s.Discount);
        var netRevenue = completedSales.Sum(s => s.Total);
        var totalCollected = completedSales.Sum(s => s.PaidAmount);

        var summary = new SalesReportSummaryDto(
            start,
            end,
            completedSales.Count,
            voidedCount,
            totalSubtotal,
            totalDiscount,
            netRevenue,
            totalCollected
        );

        var dailyTrends = completedSales
            .GroupBy(s => s.SaleDate.ToString("yyyy-MM-dd"))
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var rev = g.Sum(s => s.Total);
                var cost = g.SelectMany(s => s.Items).Sum(i =>
                {
                    var avgCost = i.Product?.InventoryBalance?.AverageCost ?? i.Product?.CostPrice ?? 0m;
                    return i.Quantity * avgCost;
                });
                return new DailySalesTrendDto(
                    g.Key,
                    g.Count(),
                    rev,
                    rev - cost
                );
            }).ToList();

        return new SalesReportDto(summary, dailyTrends);
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync(CancellationToken cancellationToken = default)
    {
        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        var items = products.Select(p =>
        {
            var onHand = p.InventoryBalance?.QuantityOnHand ?? 0m;
            var avgCost = p.InventoryBalance?.AverageCost ?? p.CostPrice;
            var costVal = onHand * avgCost;
            var retailVal = onHand * p.SellingPrice;

            return new InventoryValuationItemDto(
                p.Id,
                p.SKU,
                p.Name,
                p.Category?.Name,
                onHand,
                avgCost,
                p.SellingPrice,
                costVal,
                retailVal,
                retailVal - costVal
            );
        }).ToList();

        var totalOnHand = items.Sum(i => i.QuantityOnHand);
        var totalCostVal = items.Sum(i => i.TotalCostValue);
        var totalRetailVal = items.Sum(i => i.TotalRetailValue);
        var lowStockCount = products.Count(p => 
            p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand <= p.ReorderLevel);

        return new InventoryReportDto(
            products.Count,
            totalOnHand,
            totalCostVal,
            totalRetailVal,
            lowStockCount,
            items
        );
    }

    public async Task<ProfitReportDto> GetProfitReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var start = fromDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = toDate ?? DateTime.UtcNow;

        var sales = await _db.Sales
            .AsNoTracking()
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .Where(s => s.Status == SaleStatus.Completed && s.SaleDate >= start && s.SaleDate <= end)
            .ToListAsync(cancellationToken);

        decimal totalRevenue = sales.Sum(s => s.Total);
        decimal cogs = sales.SelectMany(s => s.Items).Sum(i =>
        {
            var avgCost = i.Product?.InventoryBalance?.AverageCost ?? i.Product?.CostPrice ?? 0m;
            return i.Quantity * avgCost;
        });

        decimal grossProfit = totalRevenue - cogs;
        decimal grossMargin = totalRevenue > 0 
            ? Math.Round((grossProfit / totalRevenue) * 100m, 2) 
            : 0m;

        return new ProfitReportDto(
            start,
            end,
            totalRevenue,
            cogs,
            grossProfit,
            grossMargin
        );
    }
}
