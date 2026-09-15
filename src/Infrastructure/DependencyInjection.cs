using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Infrastructure.Data;
using SwiftSale.Infrastructure.Security;

namespace SwiftSale.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "InMemory:SwiftSale_Fallback";

        if (connectionString.StartsWith("InMemory:", StringComparison.OrdinalIgnoreCase))
        {
            var dbName = connectionString["InMemory:".Length..];
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase(string.IsNullOrWhiteSpace(dbName) ? "SwiftSale_TestDb" : dbName);
            });
        }
        else
        {
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(connectionString, b =>
                {
                    b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                });
            });
        }

        services.AddScoped<IAppDbContext>(provider => 
            provider.GetRequiredService<AppDbContext>());

        services.AddSingleton<ITokenService, JwtTokenService>();

        return services;
    }
}
