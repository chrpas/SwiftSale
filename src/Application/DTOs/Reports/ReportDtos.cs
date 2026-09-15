namespace SwiftSale.Application.DTOs.Reports;

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
