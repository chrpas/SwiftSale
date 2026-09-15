using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SwiftSale.Infrastructure.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Search for appsettings.Development.json in Api project or use default fallback
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Api");
        var connectionString = "Host=localhost;Port=5432;Database=swiftsale_db;Username=postgres;Password=postgrespassword";

        if (Directory.Exists(basePath))
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            var configured = config.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrEmpty(configured))
            {
                connectionString = configured;
            }
        }

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString, b =>
        {
            b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
        });

        return new AppDbContext(optionsBuilder.Options);
    }
}
