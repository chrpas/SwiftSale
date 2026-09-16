using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SwiftSale.Application.Services;

namespace SwiftSale.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ISaleService, SaleService>();
        services.AddScoped<IPurchaseService, PurchaseService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IReportingService, ReportingService>();
        services.AddScoped<IReportService, ReportingService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
