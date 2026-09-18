using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Reports;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.Services;

public class ReportingService : IReportingService, IReportService
{
    private readonly IAppDbContext _db;

    static ReportingService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
        QuestPDF.Settings.UseSystemFonts = true;
        QuestPDF.Settings.ThrowOnMissingFontFamilies = false;
    }

    public ReportingService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<ReportOverviewDto> GetOverviewAsync(ReportFilterParams filters, CancellationToken cancellationToken = default)
    {
        var (salesQuery, productsQuery) = PrepareBaseQueries(filters);

        var completedSales = await salesQuery
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .ToListAsync(cancellationToken);

        decimal totalSales = 0m;
        decimal totalCogs = 0m;

        foreach (var sale in completedSales)
        {
            foreach (var item in sale.Items)
            {
                // If filtering by product/category, ensure item matches
                if (filters.ProductId.HasValue && item.ProductId != filters.ProductId.Value)
                    continue;
                if (filters.CategoryId.HasValue && item.Product?.CategoryId != filters.CategoryId.Value)
                    continue;

                decimal itemRevenue = item.Total > 0 ? item.Total : ((item.Quantity * item.UnitPrice) - item.Discount);
                decimal itemAvgCost = (item.Product?.InventoryBalance != null && item.Product.InventoryBalance.AverageCost > 0m)
                    ? item.Product.InventoryBalance.AverageCost
                    : (item.Product?.CostPrice ?? 0m);
                decimal baseQty = item.BaseQuantityDeducted > 0 ? item.BaseQuantityDeducted : item.Quantity;
                decimal itemCost = baseQty * itemAvgCost;

                totalSales += itemRevenue;
                totalCogs += itemCost;
            }
        }

        decimal grossProfit = totalSales - totalCogs;
        decimal grossMargin = totalSales > 0m
            ? Math.Round((grossProfit / totalSales) * 100m, 2)
            : 0m;

        // Inventory valuation
        var products = await productsQuery
            .Include(p => p.InventoryBalance)
            .ToListAsync(cancellationToken);

        decimal totalUnitsOnHand = 0m;
        decimal totalInventoryValue = 0m;
        int activeSkus = products.Count;
        int lowStockCount = 0;
        int outOfStockCount = 0;

        foreach (var p in products)
        {
            var qty = p.InventoryBalance?.QuantityOnHand ?? 0m;
            var avgCost = (p.InventoryBalance != null && p.InventoryBalance.AverageCost > 0m) ? p.InventoryBalance.AverageCost : p.CostPrice;
            totalUnitsOnHand += qty;
            totalInventoryValue += (qty * avgCost);

            if (qty <= 0m)
            {
                outOfStockCount++;
            }
            else if (qty <= p.ReorderLevel)
            {
                lowStockCount++;
            }
        }

        // Calculate Voided Orders & Amounts
        var voidedSalesQuery = _db.Sales
            .AsNoTracking()
            .Where(s => s.Status == SaleStatus.Voided);

        if (filters.StartDate.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(filters.StartDate.Value, DateTimeKind.Utc);
            voidedSalesQuery = voidedSalesQuery.Where(s => s.SaleDate >= startUtc);
        }

        if (filters.EndDate.HasValue)
        {
            var endUtc = DateTime.SpecifyKind(filters.EndDate.Value, DateTimeKind.Utc);
            voidedSalesQuery = voidedSalesQuery.Where(s => s.SaleDate <= endUtc);
        }

        if (filters.PaymentMethod.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Payments.Any(p => p.Method == filters.PaymentMethod.Value));
        }

        if (filters.ProductId.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Items.Any(i => i.ProductId == filters.ProductId.Value));
        }

        if (filters.CategoryId.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Items.Any(i => i.Product != null && i.Product.CategoryId == filters.CategoryId.Value));
        }

        var voidedSales = await voidedSalesQuery.ToListAsync(cancellationToken);
        int voidedOrdersCount = voidedSales.Count;
        decimal voidedSalesAmount = voidedSales.Sum(s => s.Total);

        return new ReportOverviewDto(
            TotalSales: Math.Round(totalSales, 2),
            TotalOrders: completedSales.Count,
            CostOfGoodsSold: Math.Round(totalCogs, 2),
            GrossProfit: Math.Round(grossProfit, 2),
            GrossMarginPercent: grossMargin,
            InventoryValue: Math.Round(totalInventoryValue, 2),
            ActiveSkus: activeSkus,
            LowStockCount: lowStockCount,
            TotalUnitsOnHand: totalUnitsOnHand,
            OutOfStockCount: outOfStockCount,
            VoidedOrdersCount: voidedOrdersCount,
            VoidedSalesAmount: Math.Round(voidedSalesAmount, 2)
        );
    }

    public async Task<List<SalesTrendDto>> GetSalesTrendAsync(ReportFilterParams filters, CancellationToken cancellationToken = default)
    {
        var (salesQuery, _) = PrepareBaseQueries(filters);

        var sales = await salesQuery
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .OrderBy(s => s.SaleDate)
            .ToListAsync(cancellationToken);

        var grouped = sales
            .GroupBy(s => s.SaleDate.ToString("yyyy-MM-dd"))
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                decimal dayRev = 0m;
                decimal dayCogs = 0m;

                foreach (var s in g)
                {
                    foreach (var i in s.Items)
                    {
                        if (filters.ProductId.HasValue && i.ProductId != filters.ProductId.Value)
                            continue;
                        if (filters.CategoryId.HasValue && i.Product?.CategoryId != filters.CategoryId.Value)
                            continue;

                        dayRev += i.Total > 0 ? i.Total : ((i.Quantity * i.UnitPrice) - i.Discount);
                        var avgCost = (i.Product?.InventoryBalance != null && i.Product.InventoryBalance.AverageCost > 0m)
                            ? i.Product.InventoryBalance.AverageCost
                            : (i.Product?.CostPrice ?? 0m);
                        var baseQty = i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity;
                        dayCogs += (baseQty * avgCost);
                    }
                }

                return new SalesTrendDto(
                    Date: g.Key,
                    Revenue: Math.Round(dayRev, 2),
                    GrossProfit: Math.Round(dayRev - dayCogs, 2),
                    OrderCount: g.Count()
                );
            })
            .ToList();

        return grouped;
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(ReportFilterParams filters, int limit = 20, CancellationToken cancellationToken = default)
    {
        var (salesQuery, _) = PrepareBaseQueries(filters);

        var sales = await salesQuery
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Category)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.InventoryBalance)
            .ToListAsync(cancellationToken);

        var items = sales.SelectMany(s => s.Items).Where(i => i.Product != null);

        if (filters.ProductId.HasValue)
            items = items.Where(i => i.ProductId == filters.ProductId.Value);
        if (filters.CategoryId.HasValue)
            items = items.Where(i => i.Product!.CategoryId == filters.CategoryId.Value);

        var grouped = items
            .GroupBy(i => new
            {
                i.ProductId,
                i.Product!.SKU,
                i.Product.Name,
                Category = i.Product.Category != null ? i.Product.Category.Name : "General"
            })
            .Select(g =>
            {
                decimal qty = g.Sum(x => x.BaseQuantityDeducted > 0 ? x.BaseQuantityDeducted : x.Quantity);
                decimal rev = g.Sum(x => x.Total > 0 ? x.Total : ((x.Quantity * x.UnitPrice) - x.Discount));
                decimal cogs = g.Sum(x =>
                {
                    var avgCost = (x.Product?.InventoryBalance != null && x.Product.InventoryBalance.AverageCost > 0m)
                        ? x.Product.InventoryBalance.AverageCost
                        : (x.Product?.CostPrice ?? 0m);
                    var baseQty = x.BaseQuantityDeducted > 0 ? x.BaseQuantityDeducted : x.Quantity;
                    return baseQty * avgCost;
                });
                decimal profit = rev - cogs;
                decimal margin = rev > 0m ? Math.Round((profit / rev) * 100m, 2) : 0m;

                return new TopProductDto(
                    ProductId: g.Key.ProductId,
                    Sku: g.Key.SKU,
                    Name: g.Key.Name,
                    Category: g.Key.Category,
                    QuantitySold: qty,
                    Revenue: Math.Round(rev, 2),
                    Cogs: Math.Round(cogs, 2),
                    GrossProfit: Math.Round(profit, 2),
                    MarginPercent: margin
                );
            })
            .OrderByDescending(x => x.QuantitySold)
            .ThenByDescending(x => x.Revenue)
            .Take(limit)
            .ToList();

        return grouped;
    }

    public async Task<List<SlowMovingProductDto>> GetSlowMovingProductsAsync(ReportFilterParams filters, CancellationToken cancellationToken = default)
    {
        var (_, productsQuery) = PrepareBaseQueries(filters);

        var activeProducts = await productsQuery
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .Where(p => p.InventoryBalance != null && p.InventoryBalance.QuantityOnHand > 0)
            .ToListAsync(cancellationToken);

        // Get completed sales in range
        var (salesQuery, _) = PrepareBaseQueries(filters);
        var completedSales = await salesQuery
            .Include(s => s.Items)
            .ToListAsync(cancellationToken);

        // Map product sold quantity in the filtered period (in Base Pieces)
        var productSoldInPeriod = completedSales
            .SelectMany(s => s.Items)
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.BaseQuantityDeducted > 0 ? i.BaseQuantityDeducted : i.Quantity));

        // Get all completed sales across all time to find LastSaleDate
        var allCompletedSales = await _db.Sales
            .AsNoTracking()
            .Where(s => s.Status == SaleStatus.Completed)
            .SelectMany(s => s.Items.Select(i => new { i.ProductId, s.SaleDate }))
            .GroupBy(x => x.ProductId)
            .Select(g => new { ProductId = g.Key, LastSaleDate = g.Max(x => x.SaleDate) })
            .ToDictionaryAsync(x => x.ProductId, x => x.LastSaleDate, cancellationToken);

        var now = DateTime.UtcNow;
        var threshold = filters.InactivityThresholdDays > 0 ? filters.InactivityThresholdDays : 30;

        var result = new List<SlowMovingProductDto>();

        foreach (var p in activeProducts)
        {
            decimal qtySold = productSoldInPeriod.TryGetValue(p.Id, out var sVal) ? sVal : 0m;
            DateTime? lastDate = allCompletedSales.TryGetValue(p.Id, out var dVal) ? dVal : null;
            int? daysInactive = lastDate.HasValue ? (int)(now - lastDate.Value).TotalDays : null;

            // Slow moving condition: zero or low sales in range OR days inactive >= threshold
            bool isSlowMoving = qtySold <= 0m || (daysInactive.HasValue && daysInactive.Value >= threshold);

            if (isSlowMoving)
            {
                var onHand = p.InventoryBalance?.QuantityOnHand ?? 0m;
                var avgCost = (p.InventoryBalance != null && p.InventoryBalance.AverageCost > 0m) ? p.InventoryBalance.AverageCost : p.CostPrice;
                var tiedCost = onHand * avgCost;

                result.Add(new SlowMovingProductDto(
                    ProductId: p.Id,
                    Sku: p.SKU,
                    Name: p.Name,
                    Category: p.Category?.Name ?? "General",
                    CurrentStock: onHand,
                    InventoryCost: Math.Round(tiedCost, 2),
                    QuantitySold: qtySold,
                    DaysSinceLastSale: daysInactive,
                    LastSaleDate: lastDate
                ));
            }
        }

        return result
            .OrderByDescending(x => x.InventoryCost)
            .ToList();
    }

    public async Task<List<VoidedSaleDetailDto>> GetVoidedSalesAsync(ReportFilterParams filters, CancellationToken cancellationToken = default)
    {
        var voidedSalesQuery = _db.Sales
            .AsNoTracking()
            .Include(s => s.Customer)
            .Include(s => s.Payments)
            .Where(s => s.Status == SaleStatus.Voided);

        if (filters.StartDate.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(filters.StartDate.Value, DateTimeKind.Utc);
            voidedSalesQuery = voidedSalesQuery.Where(s => s.SaleDate >= startUtc);
        }

        if (filters.EndDate.HasValue)
        {
            var endUtc = DateTime.SpecifyKind(filters.EndDate.Value, DateTimeKind.Utc);
            voidedSalesQuery = voidedSalesQuery.Where(s => s.SaleDate <= endUtc);
        }

        if (filters.PaymentMethod.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Payments.Any(p => p.Method == filters.PaymentMethod.Value));
        }

        if (filters.ProductId.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Items.Any(i => i.ProductId == filters.ProductId.Value));
        }

        if (filters.CategoryId.HasValue)
        {
            voidedSalesQuery = voidedSalesQuery.Where(s => s.Items.Any(i => i.Product != null && i.Product.CategoryId == filters.CategoryId.Value));
        }

        var sales = await voidedSalesQuery
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync(cancellationToken);

        var voidedSaleIds = sales.Select(s => s.Id).ToList();

        var voidMovements = await _db.StockMovements
            .AsNoTracking()
            .Where(m => m.ReferenceId.HasValue && voidedSaleIds.Contains(m.ReferenceId.Value) && m.Type == StockMovementType.SaleVoidReturn)
            .ToListAsync(cancellationToken);

        var movementReasons = voidMovements
            .GroupBy(m => m.ReferenceId!.Value)
            .ToDictionary(g => g.Key, g => g.First().Reason);

        var result = new List<VoidedSaleDetailDto>();

        foreach (var sale in sales)
        {
            var checkPayment = sale.Payments.FirstOrDefault(p => !string.IsNullOrEmpty(p.DishonorReason) || !string.IsNullOrEmpty(p.CheckNumber));
            
            string? checkNo = checkPayment?.CheckNumber ?? checkPayment?.ReferenceNo;
            string? bankName = checkPayment?.BankName;

            string? reason = checkPayment?.DishonorReason;
            if (string.IsNullOrWhiteSpace(reason))
            {
                if (movementReasons.TryGetValue(sale.Id, out var mReason) && !string.IsNullOrWhiteSpace(mReason))
                {
                    reason = mReason;
                }
                else
                {
                    reason = "Sale Voided";
                }
            }

            result.Add(new VoidedSaleDetailDto(
                SaleId: sale.Id,
                InvoiceNo: sale.InvoiceNo,
                DeliveryReceiptNo: sale.DeliveryReceiptNo,
                CustomerName: sale.Customer?.Name ?? "Walk-in Customer",
                SaleDate: sale.SaleDate,
                TotalAmount: sale.Total,
                CheckNumber: checkNo,
                BankName: bankName,
                Reason: reason
            ));
        }

        return result;
    }

    public async Task<byte[]> GeneratePdfReportAsync(ReportFilterParams filters, CancellationToken cancellationToken = default)
    {
        var overview = await GetOverviewAsync(filters, cancellationToken);
        var trend = await GetSalesTrendAsync(filters, cancellationToken);
        var topProducts = await GetTopProductsAsync(filters, 25, cancellationToken);
        var slowMoving = await GetSlowMovingProductsAsync(filters, cancellationToken);
        var voidedSales = await GetVoidedSalesAsync(filters, cancellationToken);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(28);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor("#1E293B"));

                page.Header().Element(c => ComposeHeader(c, filters));
                page.Content().Element(c => ComposeContent(c, overview, trend, topProducts, slowMoving, voidedSales, filters));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    #region QuestPDF Components

    private static void ComposeHeader(IContainer container, ReportFilterParams filters)
    {
        container.BorderBottom(1).BorderColor("#CBD5E1").PaddingBottom(8).Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("SWIFTSALE").FontSize(16).Bold().FontColor("#0D7A5F");
                col.Item().Text("OPERATIONAL & FINANCIAL PERFORMANCE REPORT").FontSize(8).FontColor("#64748B").Bold();
            });

            row.RelativeItem().AlignRight().Column(col =>
            {
                col.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(8).FontColor("#64748B");
                var rangeText = (filters.StartDate.HasValue && filters.EndDate.HasValue)
                    ? $"{filters.StartDate.Value:yyyy-MM-dd} to {filters.EndDate.Value:yyyy-MM-dd}"
                    : "Full Operational History";
                col.Item().Text($"Period: {rangeText}").FontSize(8).SemiBold().FontColor("#0D7A5F");
            });
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.BorderTop(1).BorderColor("#E2E8F0").PaddingTop(6).Row(row =>
        {
            row.RelativeItem().Text("SwiftSale POS & Dual-Ledger Inventory System • Confidential & Proprietary")
                .FontSize(7).FontColor("#94A3B8");

            row.RelativeItem().AlignRight().Text(text =>
            {
                text.Span("Page ").FontSize(7).FontColor("#94A3B8");
                text.CurrentPageNumber().FontSize(7).FontColor("#0D7A5F").Bold();
                text.Span(" of ").FontSize(7).FontColor("#94A3B8");
                text.TotalPages().FontSize(7).FontColor("#94A3B8");
            });
        });
    }

    private static void ComposeContent(
        IContainer container,
        ReportOverviewDto overview,
        List<SalesTrendDto> trend,
        List<TopProductDto> topProducts,
        List<SlowMovingProductDto> slowMoving,
        List<VoidedSaleDetailDto> voidedSales,
        ReportFilterParams filters)
    {
        container.Column(col =>
        {
            // -------------------------------------------------------------
            // PAGE 1: Executive Overview & KPI Highlights
            // -------------------------------------------------------------
            col.Item().PaddingTop(12).PaddingBottom(6).Text("EXECUTIVE FINANCIAL OVERVIEW").FontSize(11).Bold().FontColor("#1D3530");
            col.Item().Text("Summary of commercial revenue, profitability, COGS, and current asset position.")
                .FontSize(8).FontColor("#64748B").Italic();

            // 5 KPI Cards Grid
            col.Item().PaddingTop(10).Row(row =>
            {
                // Card 1: Total Revenue
                row.RelativeItem().Background("#F2F7F4").Border(1).BorderColor("#D1E7DD").Padding(6).Column(c =>
                {
                    c.Item().Text("REVENUE").FontSize(6.5f).Bold().FontColor("#0D7A5F");
                    c.Item().Text($"₱{overview.TotalSales:N2}").FontSize(11).Bold().FontColor("#0D7A5F");
                    c.Item().Text($"{overview.TotalOrders} completed orders").FontSize(6.5f).FontColor("#64748B");
                });

                row.ConstantItem(5);

                // Card 2: Gross Profit & Margin
                row.RelativeItem().Background("#F8FAFC").Border(1).BorderColor("#E2E8F0").Padding(6).Column(c =>
                {
                    c.Item().Row(r =>
                    {
                        r.RelativeItem().Text("GROSS PROFIT").FontSize(6.5f).Bold().FontColor("#334155");
                        r.ConstantItem(35).AlignRight().Text($"{overview.GrossMarginPercent:F1}%").FontSize(6.5f).Bold().FontColor("#0D7A5F");
                    });
                    c.Item().Text($"₱{overview.GrossProfit:N2}").FontSize(11).Bold().FontColor("#1E293B");
                    c.Item().Text("Net margin realized").FontSize(6.5f).FontColor("#64748B");
                });

                row.ConstantItem(5);

                // Card 3: COGS
                row.RelativeItem().Background("#F8FAFC").Border(1).BorderColor("#E2E8F0").Padding(6).Column(c =>
                {
                    c.Item().Text("COGS").FontSize(6.5f).Bold().FontColor("#64748B");
                    c.Item().Text($"₱{overview.CostOfGoodsSold:N2}").FontSize(11).Bold().FontColor("#475569");
                    c.Item().Text("Average cost").FontSize(6.5f).FontColor("#64748B");
                });

                row.ConstantItem(5);

                // Card 4: Inventory Health
                row.RelativeItem().Background("#F8FAFC").Border(1).BorderColor("#E2E8F0").Padding(6).Column(c =>
                {
                    c.Item().Text("INVENTORY VALUE").FontSize(6.5f).Bold().FontColor("#64748B");
                    c.Item().Text($"₱{overview.InventoryValue:N2}").FontSize(11).Bold().FontColor("#1E293B");
                    c.Item().Text($"{overview.ActiveSkus} SKUs • {overview.LowStockCount} low").FontSize(6.5f).FontColor("#D97706");
                });

                row.ConstantItem(5);

                // Card 5: Voided Orders & Reversals
                row.RelativeItem().Background("#FFF1F2").Border(1).BorderColor("#FECDD3").Padding(6).Column(c =>
                {
                    c.Item().Text("VOIDED ORDERS").FontSize(6.5f).Bold().FontColor("#E11D48");
                    c.Item().Text($"₱{overview.VoidedSalesAmount:N2}").FontSize(11).Bold().FontColor("#BE123C");
                    c.Item().Text($"{overview.VoidedOrdersCount} voided orders").FontSize(6.5f).FontColor("#9F1239");
                });
            });

            // Page 1 Section: Recent Daily Sales Trend
            col.Item().PaddingTop(16).Text("DAILY SALES & MARGIN BREAKDOWN").FontSize(9).Bold().FontColor("#1D3530");

            col.Item().PaddingTop(6).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2); // Date
                    columns.RelativeColumn(1); // Orders
                    columns.RelativeColumn(2); // Revenue
                    columns.RelativeColumn(2); // Gross Profit
                    columns.RelativeColumn(1.5f); // Margin %
                });

                table.Header(header =>
                {
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Date").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Orders").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Revenue").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Gross Profit").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Margin %").FontSize(7).Bold().FontColor("#FFFFFF");
                });

                if (trend.Count == 0)
                {
                    table.Cell().ColumnSpan(5).Padding(8).AlignCenter().Text("No sales activity recorded in selected timeframe.").FontSize(8).FontColor("#94A3B8");
                }
                else
                {
                    int rowIdx = 0;
                    foreach (var item in trend.Take(12))
                    {
                        var bg = rowIdx % 2 == 0 ? "#FFFFFF" : "#F8FAFC";
                        decimal margin = item.Revenue > 0 ? Math.Round((item.GrossProfit / item.Revenue) * 100m, 1) : 0m;

                        table.Cell().Background(bg).Padding(4).Text(item.Date).FontSize(7);
                        table.Cell().Background(bg).Padding(4).Text(item.OrderCount.ToString()).FontSize(7);
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{item.Revenue:N2}").FontSize(7).Bold();
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{item.GrossProfit:N2}").FontSize(7).FontColor("#0D7A5F");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"{margin:F1}%").FontSize(7);
                        rowIdx++;
                    }
                }
            });

            // Page 1 Section: Voided Sales & Check Reversals (Placed directly below DAILY SALES & MARGIN BREAKDOWN)
            col.Item().PaddingTop(14).Text("VOIDED SALES & CHECK REVERSALS").FontSize(9).Bold().FontColor("#991B1B");

            col.Item().PaddingTop(6).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(85); // Invoice / DR #
                    columns.ConstantColumn(65); // Date
                    columns.RelativeColumn(2);  // Customer Name
                    columns.RelativeColumn(2);  // Check # & Bank
                    columns.RelativeColumn(3);  // Reason
                    columns.ConstantColumn(65); // Amount
                });

                table.Header(header =>
                {
                    header.Cell().Background("#991B1B").Padding(4).Text("Invoice / DR #").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#991B1B").Padding(4).Text("Date").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#991B1B").Padding(4).Text("Customer").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#991B1B").Padding(4).Text("Check & Bank").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#991B1B").Padding(4).Text("Void / Bounced Reason").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#991B1B").Padding(4).AlignRight().Text("Amount").FontSize(7).Bold().FontColor("#FFFFFF");
                });

                if (voidedSales.Count == 0)
                {
                    table.Cell().ColumnSpan(6).Padding(8).AlignCenter().Text("No voided sales or bounced checks recorded in selected timeframe.").FontSize(8).FontColor("#0D7A5F");
                }
                else
                {
                    int rowIdx = 0;
                    foreach (var item in voidedSales)
                    {
                        var bg = rowIdx % 2 == 0 ? "#FFFFFF" : "#FFF1F2";

                        table.Cell().Background(bg).Padding(4).Column(c =>
                        {
                            c.Item().Text(item.InvoiceNo).FontSize(7).Bold().FontColor("#991B1B");
                            if (!string.IsNullOrEmpty(item.DeliveryReceiptNo))
                            {
                                c.Item().Text($"DR: {item.DeliveryReceiptNo}").FontSize(6.5f).FontColor("#0D9488");
                            }
                        });
                        table.Cell().Background(bg).Padding(4).Text(item.SaleDate.ToString("yyyy-MM-dd")).FontSize(7);
                        table.Cell().Background(bg).Padding(4).Text(item.CustomerName).FontSize(7).SemiBold();
                        table.Cell().Background(bg).Padding(4).Column(c =>
                        {
                            if (!string.IsNullOrEmpty(item.CheckNumber))
                            {
                                c.Item().Text($"CHK: {item.CheckNumber}").FontSize(7).Bold().FontColor("#B45309");
                                if (!string.IsNullOrEmpty(item.BankName))
                                {
                                    c.Item().Text(item.BankName).FontSize(6.5f).FontColor("#64748B");
                                }
                            }
                            else
                            {
                                c.Item().Text("N/A").FontSize(7).FontColor("#94A3B8");
                            }
                        });
                        table.Cell().Background(bg).Padding(4).Text(item.Reason).FontSize(7).FontColor("#991B1B");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{item.TotalAmount:N2}").FontSize(7).Bold().FontColor("#991B1B");

                        rowIdx++;
                    }
                }
            });

            // Page 1 Section: Inventory Health Summary
            col.Item().PaddingTop(16).Text("INVENTORY HEALTH & CAPITAL METRICS").FontSize(9).Bold().FontColor("#1D3530");
            col.Item().PaddingTop(6).Background("#F8FAFC").Border(1).BorderColor("#E2E8F0").Padding(8).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Total Units In Stock").FontSize(7).FontColor("#64748B");
                    c.Item().Text($"{overview.TotalUnitsOnHand:N0} units").FontSize(10).Bold().FontColor("#1E293B");
                });
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Active Product Catalog").FontSize(7).FontColor("#64748B");
                    c.Item().Text($"{overview.ActiveSkus} Active SKUs").FontSize(10).Bold().FontColor("#1E293B");
                });
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Reorder Threshold Alerts").FontSize(7).FontColor("#64748B");
                    c.Item().Text($"{overview.LowStockCount} items").FontSize(10).Bold().FontColor(overview.LowStockCount > 0 ? "#D97706" : "#0D7A5F");
                });
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Out of Stock (Zero Bal)").FontSize(7).FontColor("#64748B");
                    c.Item().Text($"{overview.OutOfStockCount} SKUs").FontSize(10).Bold().FontColor(overview.OutOfStockCount > 0 ? "#DC2626" : "#0D7A5F");
                });
            });

            // -------------------------------------------------------------
            // PAGE 2: Top Selling Products
            // -------------------------------------------------------------
            col.Item().PageBreak();

            col.Item().PaddingTop(4).PaddingBottom(6).Text("TOP SELLING PRODUCTS (VELOCITY & MARGIN)").FontSize(11).Bold().FontColor("#1D3530");
            col.Item().Text("Ranked by net sales revenue, displaying unit volume, cost of goods sold, and realized margin.")
                .FontSize(8).FontColor("#64748B").Italic();

            col.Item().PaddingTop(8).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(65); // SKU
                    columns.RelativeColumn(3);  // Name
                    columns.RelativeColumn(2);  // Category
                    columns.ConstantColumn(45); // Qty
                    columns.ConstantColumn(65); // Revenue
                    columns.ConstantColumn(60); // COGS
                    columns.ConstantColumn(65); // Profit
                    columns.ConstantColumn(45); // Margin
                });

                table.Header(header =>
                {
                    header.Cell().Background("#0D7A5F").Padding(4).Text("SKU").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Product Name").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Category").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Qty (PCS)").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Revenue (₱)").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("COGS").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Profit").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Margin").FontSize(7).Bold().FontColor("#FFFFFF");
                });

                if (topProducts.Count == 0)
                {
                    table.Cell().ColumnSpan(8).Padding(12).AlignCenter().Text("No product sales recorded in selected timeframe.").FontSize(8).FontColor("#94A3B8");
                }
                else
                {
                    int rIdx = 0;
                    foreach (var p in topProducts)
                    {
                        var bg = rIdx % 2 == 0 ? "#FFFFFF" : "#F8FAFC";
                        table.Cell().Background(bg).Padding(4).Text(p.Sku).FontSize(7).Bold().FontColor("#0D7A5F");
                        table.Cell().Background(bg).Padding(4).Text(p.Name).FontSize(7).SemiBold();
                        table.Cell().Background(bg).Padding(4).Text(p.Category).FontSize(7).FontColor("#64748B");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"{p.QuantitySold:N0}").FontSize(7);
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{p.Revenue:N2}").FontSize(7).Bold();
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{p.Cogs:N2}").FontSize(7).FontColor("#64748B");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{p.GrossProfit:N2}").FontSize(7).FontColor("#0D7A5F").SemiBold();
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"{p.MarginPercent:F1}%").FontSize(7);
                        rIdx++;
                    }
                }
            });

            // -------------------------------------------------------------
            // PAGE 3: Slow Moving Products & Inventory Age
            // -------------------------------------------------------------
            col.Item().PageBreak();

            col.Item().PaddingTop(4).PaddingBottom(6).Text("SLOW MOVING PRODUCTS & INVENTORY AGE").FontSize(11).Bold().FontColor("#1D3530");
            col.Item().Text($"Products with capital tied up in stock but zero or sluggish sales (inactivity threshold: {filters.InactivityThresholdDays} days).")
                .FontSize(8).FontColor("#64748B").Italic();

            col.Item().PaddingTop(8).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(65); // SKU
                    columns.RelativeColumn(3);  // Name
                    columns.RelativeColumn(2);  // Category
                    columns.ConstantColumn(55); // Stock
                    columns.ConstantColumn(70); // Capital Tied
                    columns.ConstantColumn(45); // Sold Qty
                    columns.ConstantColumn(55); // Days Inactive
                    columns.ConstantColumn(65); // Last Sale Date
                });

                table.Header(header =>
                {
                    header.Cell().Background("#0D7A5F").Padding(4).Text("SKU").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Product Name").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).Text("Category").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Stock").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Valuation").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Sold").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Inactive").FontSize(7).Bold().FontColor("#FFFFFF");
                    header.Cell().Background("#0D7A5F").Padding(4).AlignRight().Text("Last Sale").FontSize(7).Bold().FontColor("#FFFFFF");
                });

                if (slowMoving.Count == 0)
                {
                    table.Cell().ColumnSpan(8).Padding(12).AlignCenter().Text("No slow-moving inventory detected; product velocity is healthy.").FontSize(8).FontColor("#0D7A5F");
                }
                else
                {
                    int rIdx = 0;
                    foreach (var p in slowMoving)
                    {
                        var bg = rIdx % 2 == 0 ? "#FFFFFF" : "#F8FAFC";
                        var lastSaleStr = p.LastSaleDate.HasValue ? p.LastSaleDate.Value.ToString("yyyy-MM-dd") : "Never";
                        var inactiveStr = p.DaysSinceLastSale.HasValue ? $"{p.DaysSinceLastSale.Value}d" : "No sales";

                        table.Cell().Background(bg).Padding(4).Text(p.Sku).FontSize(7).Bold().FontColor("#0D7A5F");
                        table.Cell().Background(bg).Padding(4).Text(p.Name).FontSize(7).SemiBold();
                        table.Cell().Background(bg).Padding(4).Text(p.Category).FontSize(7).FontColor("#64748B");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"{p.CurrentStock:N0}").FontSize(7);
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"₱{p.InventoryCost:N2}").FontSize(7).Bold().FontColor("#B45309");
                        table.Cell().Background(bg).Padding(4).AlignRight().Text($"{p.QuantitySold:N0}").FontSize(7);
                        table.Cell().Background(bg).Padding(4).AlignRight().Text(inactiveStr).FontSize(7).FontColor("#DC2626").Bold();
                        table.Cell().Background(bg).Padding(4).AlignRight().Text(lastSaleStr).FontSize(7);
                        rIdx++;
                    }
                }
            });
        });
    }

    #endregion

    #region Helper Methods

    private (IQueryable<Sale> salesQuery, IQueryable<Product> productsQuery) PrepareBaseQueries(ReportFilterParams filters)
    {
        var salesQuery = _db.Sales
            .AsNoTracking()
            .Where(s => s.Status == SaleStatus.Completed);

        if (filters.StartDate.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(filters.StartDate.Value, DateTimeKind.Utc);
            salesQuery = salesQuery.Where(s => s.SaleDate >= startUtc);
        }

        if (filters.EndDate.HasValue)
        {
            var endUtc = DateTime.SpecifyKind(filters.EndDate.Value, DateTimeKind.Utc);
            salesQuery = salesQuery.Where(s => s.SaleDate <= endUtc);
        }

        if (filters.PaymentMethod.HasValue)
        {
            salesQuery = salesQuery.Where(s => s.Payments.Any(p => p.Method == filters.PaymentMethod.Value));
        }

        if (filters.ProductId.HasValue)
        {
            salesQuery = salesQuery.Where(s => s.Items.Any(i => i.ProductId == filters.ProductId.Value));
        }

        if (filters.CategoryId.HasValue)
        {
            salesQuery = salesQuery.Where(s => s.Items.Any(i => i.Product != null && i.Product.CategoryId == filters.CategoryId.Value));
        }

        var productsQuery = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive);

        if (filters.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == filters.CategoryId.Value);
        }

        if (filters.ProductId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.Id == filters.ProductId.Value);
        }

        return (salesQuery, productsQuery);
    }

    #endregion

    #region Legacy IReportService Implementation for Backwards Compatibility

    public async Task<SalesReportDto> GetSalesReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var filters = new ReportFilterParams { StartDate = fromDate, EndDate = toDate };
        var overview = await GetOverviewAsync(filters, cancellationToken);
        var trends = await GetSalesTrendAsync(filters, cancellationToken);

        var summary = new SalesReportSummaryDto(
            fromDate ?? DateTime.UtcNow.AddDays(-30),
            toDate ?? DateTime.UtcNow,
            overview.TotalOrders,
            0,
            overview.TotalSales,
            0m,
            overview.TotalSales,
            overview.TotalSales
        );

        var dailyTrends = trends.Select(t => new DailySalesTrendDto(
            t.Date,
            t.OrderCount,
            t.Revenue,
            t.GrossProfit
        )).ToList();

        return new SalesReportDto(summary, dailyTrends);
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync(CancellationToken cancellationToken = default)
    {
        var filters = new ReportFilterParams();
        var overview = await GetOverviewAsync(filters, cancellationToken);

        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.InventoryBalance)
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        var items = products.Select(p =>
        {
            var onHand = p.InventoryBalance?.QuantityOnHand ?? 0m;
            var avgCost = (p.InventoryBalance != null && p.InventoryBalance.AverageCost > 0m) ? p.InventoryBalance.AverageCost : p.CostPrice;
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

        return new InventoryReportDto(
            overview.ActiveSkus,
            overview.TotalUnitsOnHand,
            overview.InventoryValue,
            items.Sum(i => i.TotalRetailValue),
            overview.LowStockCount,
            items
        );
    }

    public async Task<ProfitReportDto> GetProfitReportAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var filters = new ReportFilterParams { StartDate = fromDate, EndDate = toDate };
        var overview = await GetOverviewAsync(filters, cancellationToken);

        return new ProfitReportDto(
            fromDate ?? DateTime.UtcNow.AddDays(-30),
            toDate ?? DateTime.UtcNow,
            overview.TotalSales,
            overview.CostOfGoodsSold,
            overview.GrossProfit,
            overview.GrossMarginPercent
        );
    }

    #endregion
}
