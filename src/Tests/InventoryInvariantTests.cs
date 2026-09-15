using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Application.DTOs.Sales;
using SwiftSale.Application.Services;
using SwiftSale.Application.Validators;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Domain.Exceptions;
using SwiftSale.Infrastructure.Data;

namespace SwiftSale.Tests;

public class InventoryInvariantTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly SaleService _saleService;
    private readonly InventoryService _inventoryService;
    private readonly DashboardService _dashboardService;

    public InventoryInvariantTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        var createSaleValidator = new CreateSaleValidator();
        var voidSaleValidator = new VoidSaleValidator();
        var adjustmentValidator = new CreateStockAdjustmentValidator();

        _saleService = new SaleService(_context, createSaleValidator, voidSaleValidator);
        _inventoryService = new InventoryService(_context, adjustmentValidator);
        _dashboardService = new DashboardService(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private async Task<(Category Category, Product Product)> SeedProductAsync(
        string sku = "TEST-SKU-001", 
        decimal initialStock = 10m, 
        decimal costPrice = 15m, 
        decimal sellingPrice = 25m)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Test Category"
        };
        await _context.Categories.AddAsync(category);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            SKU = sku,
            Name = "Test Product",
            CategoryId = category.Id,
            CostPrice = costPrice,
            SellingPrice = sellingPrice,
            ReorderLevel = 5,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        var balance = new InventoryBalance
        {
            ProductId = product.Id,
            QuantityOnHand = initialStock,
            ReservedQuantity = 0m,
            AverageCost = costPrice
        };
        product.InventoryBalance = balance;

        await _context.Products.AddAsync(product);
        await _context.InventoryBalances.AddAsync(balance);
        await _context.SaveChangesAsync();

        return (category, product);
    }

    [Fact]
    public async Task CreateSaleAsync_WithSufficientStock_DeductsInventoryAndWritesStockMovement()
    {
        // Arrange: Product with 10 on hand
        var (_, product) = await SeedProductAsync(initialStock: 10m, costPrice: 15m, sellingPrice: 25m);

        var dto = new CreateSaleDto(
            CustomerId: null,
            Items: new List<CreateSaleItemDto>
            {
                new(product.Id, Quantity: 4m, UnitPrice: 25m, Discount: 0m)
            },
            Payments: new List<CreatePaymentDto>
            {
                new(Amount: 100m, Method: PaymentMethod.Cash)
            }
        );

        // Act
        var result = await _saleService.CreateSaleAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(100m, result.Total);
        Assert.StartsWith("INV-", result.InvoiceNo);

        // 1. Dual-ledger: Inventory balance deducted
        var balance = await _context.InventoryBalances.FirstAsync(b => b.ProductId == product.Id);
        Assert.Equal(6m, balance.QuantityOnHand);

        // 2. Dual-ledger: Accompanying SaleOut stock movement written
        var movements = await _context.StockMovements
            .Where(m => m.ProductId == product.Id && m.Type == StockMovementType.SaleOut)
            .ToListAsync();

        Assert.Single(movements);
        var movement = movements[0];
        Assert.Equal(4m, movement.Quantity);
        Assert.Equal(15m, movement.UnitCost);
        Assert.Equal("Sale", movement.ReferenceType);
        Assert.Equal(result.Id, movement.ReferenceId);
    }

    [Fact]
    public async Task CreateSaleAsync_ExceedingStock_ThrowsInsufficientStockExceptionAndBlocksSale()
    {
        // Arrange: Product with only 3 on hand
        var (_, product) = await SeedProductAsync(initialStock: 3m);

        var dto = new CreateSaleDto(
            CustomerId: null,
            Items: new List<CreateSaleItemDto>
            {
                new(product.Id, Quantity: 5m, UnitPrice: 25m, Discount: 0m)
            }
        );

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _saleService.CreateSaleAsync(dto));

        Assert.Equal(product.Id, ex.ProductId);
        Assert.Equal(product.SKU, ex.SKU);
        Assert.Equal(5m, ex.RequestedQuantity);
        Assert.Equal(3m, ex.AvailableQuantity);

        // Verify stock was not deducted (negative stock blocked)
        var balance = await _context.InventoryBalances.FirstAsync(b => b.ProductId == product.Id);
        Assert.Equal(3m, balance.QuantityOnHand);

        // Verify no sale and no movement was saved
        Assert.Empty(await _context.Sales.ToListAsync());
        Assert.Empty(await _context.StockMovements.ToListAsync());
    }

    [Fact]
    public async Task VoidSaleAsync_RestoresInventoryBalanceAndWritesSaleVoidReturnMovement()
    {
        // Arrange: Seed product with 10 on hand, then sell 4
        var (_, product) = await SeedProductAsync(initialStock: 10m, costPrice: 15m, sellingPrice: 25m);

        var saleDto = await _saleService.CreateSaleAsync(new CreateSaleDto(
            CustomerId: null,
            Items: new List<CreateSaleItemDto>
            {
                new(product.Id, Quantity: 4m, UnitPrice: 25m)
            }
        ));

        // Verify balance after sale is 6
        var balanceAfterSale = await _context.InventoryBalances.FirstAsync(b => b.ProductId == product.Id);
        Assert.Equal(6m, balanceAfterSale.QuantityOnHand);

        // Act: Void the sale
        var voidDto = new VoidSaleDto(
            SaleId: saleDto.Id,
            Reason: "Customer returned defective items"
        );
        var voidedSale = await _saleService.VoidSaleAsync(voidDto);

        // Assert
        Assert.Equal(SaleStatus.Voided, voidedSale.Status);

        // 1. Dual-ledger: Stock restored to 10
        var balanceRestored = await _context.InventoryBalances.FirstAsync(b => b.ProductId == product.Id);
        Assert.Equal(10m, balanceRestored.QuantityOnHand);

        // 2. Dual-ledger: SaleVoidReturn movement written
        var voidMovements = await _context.StockMovements
            .Where(m => m.ProductId == product.Id && m.Type == StockMovementType.SaleVoidReturn)
            .ToListAsync();

        Assert.Single(voidMovements);
        var voidMovement = voidMovements[0];
        Assert.Equal(4m, voidMovement.Quantity);
        Assert.Equal("SaleVoid", voidMovement.ReferenceType);
        Assert.Contains("Customer returned defective items", voidMovement.Reason);
    }

    [Fact]
    public async Task AdjustStockAsync_WithoutReason_FailsValidation()
    {
        // Arrange
        var (_, product) = await SeedProductAsync(initialStock: 10m);

        var dto = new CreateStockAdjustmentDto(
            ProductId: product.Id,
            Type: StockMovementType.AdjustmentIn,
            Quantity: 5m,
            UnitCost: 15m,
            Reason: "" // Empty reason should fail
        );

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() =>
            _inventoryService.AdjustStockAsync(dto));
    }

    [Fact]
    public async Task AdjustStockAsync_AdjustmentOutExceedingStock_ThrowsInsufficientStockException()
    {
        // Arrange
        var (_, product) = await SeedProductAsync(initialStock: 5m);

        var dto = new CreateStockAdjustmentDto(
            ProductId: product.Id,
            Type: StockMovementType.AdjustmentOut,
            Quantity: 10m, // Exceeds 5
            UnitCost: null,
            Reason: "Expired inventory disposal"
        );

        // Act & Assert
        await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _inventoryService.AdjustStockAsync(dto));

        var balance = await _context.InventoryBalances.FirstAsync(b => b.ProductId == product.Id);
        Assert.Equal(5m, balance.QuantityOnHand);
    }

    [Fact]
    public async Task CostAndProfitRules_CalculatesCorrectRevenueCostAndGrossMargin()
    {
        // Arrange
        // SellingPrice = 50, AverageCost = 30
        var (_, product) = await SeedProductAsync(
            sku: "MARGIN-001", 
            initialStock: 20m, 
            costPrice: 30m, 
            sellingPrice: 50m);

        // Quantity = 2, UnitPrice = 50, Discount = 10
        // Revenue = (2 * 50) - 10 = 90
        // Estimated Cost = 2 * 30 = 60
        // Estimated Gross Profit = 90 - 60 = 30
        // Gross Margin % = (30 / 90) * 100 = 33.33%
        var saleDto = new CreateSaleDto(
            CustomerId: null,
            Items: new List<CreateSaleItemDto>
            {
                new(product.Id, Quantity: 2m, UnitPrice: 50m, Discount: 10m)
            },
            Payments: new List<CreatePaymentDto>
            {
                new(Amount: 90m, Method: PaymentMethod.Cash)
            }
        );

        // Act
        var result = await _saleService.CreateSaleAsync(saleDto);

        // Assert Sale Level Calculations
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(10m, result.Discount);
        Assert.Equal(90m, result.Total); // Revenue
        Assert.Equal(60m, result.EstimatedCost);
        Assert.Equal(30m, result.GrossProfit);
        Assert.Equal(33.33m, result.GrossMarginPercent);

        // Assert Item Level Calculations
        Assert.Single(result.Items);
        var item = result.Items[0];
        Assert.Equal(90m, item.Total);
        Assert.Equal(60m, item.EstimatedCost);
        Assert.Equal(30m, item.GrossProfit);

        // Assert Dashboard Metrics
        var dashboard = await _dashboardService.GetDashboardMetricsAsync();
        Assert.Equal(90m, dashboard.TodaySales);
        Assert.Equal(30m, dashboard.TodayGrossProfit);
        Assert.Equal(90m, dashboard.MonthSales);
        Assert.Equal(30m, dashboard.MonthGrossProfit);
        Assert.Equal(33.33m, dashboard.MonthGrossMarginPercent);
    }
}
