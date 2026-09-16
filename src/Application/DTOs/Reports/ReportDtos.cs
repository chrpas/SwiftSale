using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.DTOs.Reports;

public class ReportFilterParams
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? ProductId { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public int InactivityThresholdDays { get; set; } = 30;
}

public record ReportOverviewDto(
    decimal TotalSales,
    int TotalOrders,
    decimal CostOfGoodsSold,
    decimal GrossProfit,
    decimal GrossMarginPercent,
    decimal InventoryValue,
    int ActiveSkus,
    int LowStockCount,
    decimal TotalUnitsOnHand,
    int OutOfStockCount
);

public record SalesTrendDto(
    string Date,
    decimal Revenue,
    decimal GrossProfit,
    int OrderCount
);

public record TopProductDto(
    Guid ProductId,
    string Sku,
    string Name,
    string Category,
    decimal QuantitySold,
    decimal Revenue,
    decimal Cogs,
    decimal GrossProfit,
    decimal MarginPercent
);

public record SlowMovingProductDto(
    Guid ProductId,
    string Sku,
    string Name,
    string Category,
    decimal CurrentStock,
    decimal InventoryCost,
    decimal QuantitySold,
    int? DaysSinceLastSale,
    DateTime? LastSaleDate
);

// Legacy records for backwards compatibility
public record SalesReportSummaryDto(
    DateTime FromDate,
    DateTime ToDate,
    int TotalSalesCount,
    int VoidedSalesCount,
    decimal TotalRevenue,
    decimal TotalDiscounts,
    decimal NetRevenue,
    decimal TotalCollected
);

public record DailySalesTrendDto(
    string Date,
    int SalesCount,
    decimal Revenue,
    decimal Profit
);

public record SalesReportDto(
    SalesReportSummaryDto Summary,
    List<DailySalesTrendDto> DailyTrends
);

public record InventoryValuationItemDto(
    Guid ProductId,
    string SKU,
    string Name,
    string? CategoryName,
    decimal QuantityOnHand,
    decimal AverageCost,
    decimal SellingPrice,
    decimal TotalCostValue,
    decimal TotalRetailValue,
    decimal PotentialProfit
);

public record InventoryReportDto(
    int TotalProducts,
    decimal TotalQuantityOnHand,
    decimal TotalValuation,
    decimal TotalRetailValuation,
    int LowStockItemsCount,
    List<InventoryValuationItemDto> Items
);

public record ProfitReportDto(
    DateTime FromDate,
    DateTime ToDate,
    decimal TotalRevenue,
    decimal CostOfGoodsSold,
    decimal GrossProfit,
    decimal GrossMarginPercent
);
