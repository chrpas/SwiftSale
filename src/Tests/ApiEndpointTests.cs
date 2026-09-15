using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SwiftSale.Application.DTOs.Dashboard;
using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Application.DTOs.Products;
using SwiftSale.Application.DTOs.Reports;
using SwiftSale.Application.DTOs.Sales;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;
using SwiftSale.Infrastructure.Data;

namespace SwiftSale.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", $"InMemory:{_dbName}");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"InMemory:{_dbName}"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Seed initial category for tests
            using var scope = services.BuildServiceProvider().CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();

            if (!db.Categories.Any())
            {
                db.Categories.Add(new Category
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Test Category",
                    Description = "Category for API tests"
                });
                db.SaveChanges();
            }
        });
    }
}

public class ApiEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new() 
    { 
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    public ApiEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOkWithHealthyStatus()
    {
        var response = await _client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", content);
    }

    [Fact]
    public async Task GetDashboard_ReturnsOkWithMetrics()
    {
        var response = await _client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var metrics = await response.Content.ReadFromJsonAsync<DashboardMetricsDto>(_jsonOptions);
        Assert.NotNull(metrics);
        Assert.True(metrics.TotalProductsCount >= 0);
    }

    [Fact]
    public async Task CreateProduct_AndGetById_Succeeds()
    {
        var sku = $"TEST-API-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var createDto = new CreateProductDto(
            SKU: sku,
            Name: "API Test Wireless Gadget",
            CategoryId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            UnitId: "PCS",
            CostPrice: 20m,
            SellingPrice: 40m,
            ReorderLevel: 5,
            InitialStock: 15m
        );

        // POST /api/products
        var postResponse = await _client.PostAsJsonAsync("/api/products", createDto);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var created = await postResponse.Content.ReadFromJsonAsync<ProductDto>(_jsonOptions);
        Assert.NotNull(created);
        Assert.Equal(sku, created.SKU);
        Assert.Equal(15m, created.QuantityOnHand);

        // GET /api/products/{id}
        var getResponse = await _client.GetAsync($"/api/products/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var fetched = await getResponse.Content.ReadFromJsonAsync<ProductDto>(_jsonOptions);
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
    }

    [Fact]
    public async Task CreateSale_DeductsInventory_AndReturnsInvoice()
    {
        // 1. Create product with initial stock 10
        var sku = $"SALE-TEST-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var productRes = await _client.PostAsJsonAsync("/api/products", new CreateProductDto(
            SKU: sku,
            Name: "Checkout Test Product",
            CategoryId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            UnitId: "PCS",
            CostPrice: 10m,
            SellingPrice: 25m,
            ReorderLevel: 3,
            InitialStock: 10m
        ));
        var product = await productRes.Content.ReadFromJsonAsync<ProductDto>(_jsonOptions);
        Assert.NotNull(product);

        // 2. Execute checkout for 4 items
        var saleDto = new CreateSaleDto(
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

        var saleResponse = await _client.PostAsJsonAsync("/api/sales", saleDto);
        Assert.Equal(HttpStatusCode.Created, saleResponse.StatusCode);

        var sale = await saleResponse.Content.ReadFromJsonAsync<SaleDto>(_jsonOptions);
        Assert.NotNull(sale);
        Assert.StartsWith("INV-", sale.InvoiceNo);
        Assert.Equal(100m, sale.Total);

        // 3. Verify stock balance was deducted via /api/products/{id}
        var updatedProduct = await _client.GetFromJsonAsync<ProductDto>($"/api/products/{product.Id}", _jsonOptions);
        Assert.NotNull(updatedProduct);
        Assert.Equal(6m, updatedProduct.QuantityOnHand);

        // 4. Verify StockMovement exists via /api/stock-movements
        var movementsResponse = await _client.GetAsync($"/api/stock-movements?productId={product.Id}");
        Assert.Equal(HttpStatusCode.OK, movementsResponse.StatusCode);
        var movements = await movementsResponse.Content.ReadFromJsonAsync<List<StockMovementDto>>(_jsonOptions);
        Assert.NotNull(movements);
        Assert.Contains(movements, m => m.Type == StockMovementType.SaleOut && m.Quantity == 4m);
    }

    [Fact]
    public async Task CreateSale_ExceedingStock_Returns400ProblemDetails()
    {
        // 1. Create product with stock 2
        var sku = $"OVERSELL-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var productRes = await _client.PostAsJsonAsync("/api/products", new CreateProductDto(
            SKU: sku,
            Name: "Oversell Test Product",
            CategoryId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            UnitId: "PCS",
            CostPrice: 10m,
            SellingPrice: 20m,
            ReorderLevel: 1,
            InitialStock: 2m
        ));
        var product = await productRes.Content.ReadFromJsonAsync<ProductDto>(_jsonOptions);
        Assert.NotNull(product);

        // 2. Attempt to sell 5 items (only 2 available)
        var saleDto = new CreateSaleDto(
            CustomerId: null,
            Items: new List<CreateSaleItemDto>
            {
                new(product.Id, Quantity: 5m, UnitPrice: 20m)
            }
        );

        var response = await _client.PostAsJsonAsync("/api/sales", saleDto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(_jsonOptions);
        Assert.NotNull(problem);
        Assert.Equal("Insufficient Stock", problem.Title);
        Assert.Contains(sku, problem.Detail);
    }

    [Fact]
    public async Task GetReports_ReturnsOkForSalesInventoryAndProfit()
    {
        var salesReportRes = await _client.GetAsync("/api/reports/sales");
        Assert.Equal(HttpStatusCode.OK, salesReportRes.StatusCode);
        var salesReport = await salesReportRes.Content.ReadFromJsonAsync<SalesReportDto>(_jsonOptions);
        Assert.NotNull(salesReport);

        var inventoryReportRes = await _client.GetAsync("/api/reports/inventory");
        Assert.Equal(HttpStatusCode.OK, inventoryReportRes.StatusCode);
        var inventoryReport = await inventoryReportRes.Content.ReadFromJsonAsync<InventoryReportDto>(_jsonOptions);
        Assert.NotNull(inventoryReport);

        var profitReportRes = await _client.GetAsync("/api/reports/profit");
        Assert.Equal(HttpStatusCode.OK, profitReportRes.StatusCode);
        var profitReport = await profitReportRes.Content.ReadFromJsonAsync<ProfitReportDto>(_jsonOptions);
        Assert.NotNull(profitReport);
    }
}
