using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Security;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Apply pending migrations automatically if any
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }

        // Seed admin user if no users exist
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Username = "admin",
                FullName = "System Administrator",
                PasswordHash = PasswordHasher.HashPassword("admin123"),
                Role = "Admin",
                IsActive = true
            };
            var cashierUser = new User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Username = "cashier",
                FullName = "Default Cashier",
                PasswordHash = PasswordHasher.HashPassword("cashier123"),
                Role = "Cashier",
                IsActive = true
            };
            await context.Users.AddRangeAsync(adminUser, cashierUser);
            await context.SaveChangesAsync();
        }

        // Seed units of measure if none exist
        if (!await context.UnitsOfMeasure.AnyAsync())
        {
            var units = new[]
            {
                new UnitOfMeasure { Name = "Piece", Abbreviation = "Pcs" },
                new UnitOfMeasure { Name = "Box", Abbreviation = "Box" },
                new UnitOfMeasure { Name = "Bag", Abbreviation = "Bag" },
                new UnitOfMeasure { Name = "Kilogram", Abbreviation = "Kg" },
                new UnitOfMeasure { Name = "Gram", Abbreviation = "g" },
                new UnitOfMeasure { Name = "Liter", Abbreviation = "L" },
                new UnitOfMeasure { Name = "Milliliter", Abbreviation = "mL" },
                new UnitOfMeasure { Name = "Dozen", Abbreviation = "Doz" },
                new UnitOfMeasure { Name = "Pack", Abbreviation = "Pk" },
                new UnitOfMeasure { Name = "Tin", Abbreviation = "Tin" }
            };
            await context.UnitsOfMeasure.AddRangeAsync(units);
            await context.SaveChangesAsync();
        }

        // Check if data already exists
        if (await context.Categories.AnyAsync())
        {
            return; // DB already seeded
        }

        // 1. Categories
        var electronics = new Category
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Electronics",
            Description = "Gadgets, computer accessories, and electrical appliances"
        };

        var beverages = new Category
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Beverages",
            Description = "Soft drinks, bottled water, coffee, and juices"
        };

        var groceries = new Category
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Groceries",
            Description = "Daily essentials and packaged goods"
        };

        await context.Categories.AddRangeAsync(electronics, beverages, groceries);

        // 2. Suppliers
        var supplier = new Supplier
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "Apex Global Distribution",
            ContactPerson = "John Miller",
            Phone = "+1-555-0199",
            Email = "orders@apexdist.com",
            Address = "100 Logistics Blvd, Warehouse City"
        };

        await context.Suppliers.AddAsync(supplier);

        // 3. Customers
        var customer = new Customer
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "Acme Retail Store",
            Phone = "+1-555-0248",
            Email = "billing@acmeretail.com",
            Address = "45 Commercial Ave, Suite 200"
        };

        await context.Customers.AddAsync(customer);

        // 4. Products & Initial Inventory Balances
        var product1 = new Product
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            SKU = "ELEC-WLM-001",
            Name = "Ergonomic Wireless Mouse",
            CategoryId = electronics.Id,
            UnitId = "PCS",
            CostPrice = 14.50m,
            SellingPrice = 29.99m,
            ReorderLevel = 10,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var product2 = new Product
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            SKU = "ELEC-MKB-002",
            Name = "RGB Mechanical Keyboard",
            CategoryId = electronics.Id,
            UnitId = "PCS",
            CostPrice = 38.00m,
            SellingPrice = 74.99m,
            ReorderLevel = 5,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var product3 = new Product
        {
            Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            SKU = "BEV-ESP-003",
            Name = "Organic Espresso Roast (1kg)",
            CategoryId = beverages.Id,
            UnitId = "BAG",
            CostPrice = 11.20m,
            SellingPrice = 19.50m,
            ReorderLevel = 15,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Products.AddRangeAsync(product1, product2, product3);

        // 5. Initial Inventory Balances
        var balance1 = new InventoryBalance
        {
            ProductId = product1.Id,
            QuantityOnHand = 50m,
            ReservedQuantity = 0m,
            AverageCost = 14.50m
        };

        var balance2 = new InventoryBalance
        {
            ProductId = product2.Id,
            QuantityOnHand = 25m,
            ReservedQuantity = 2m,
            AverageCost = 38.00m
        };

        var balance3 = new InventoryBalance
        {
            ProductId = product3.Id,
            QuantityOnHand = 80m,
            ReservedQuantity = 0m,
            AverageCost = 11.20m
        };

        await context.InventoryBalances.AddRangeAsync(balance1, balance2, balance3);

        // 6. Initial Purchase & Stock Movements
        var initialPurchase = new Purchase
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            SupplierId = supplier.Id,
            ReferenceNo = "PO-2026-0001",
            PurchaseDate = DateTime.UtcNow.AddDays(-7),
            Status = PurchaseStatus.Completed,
            TotalCost = (50m * 14.50m) + (25m * 38.00m) + (80m * 11.20m),
            Items = new List<PurchaseItem>
            {
                new() { ProductId = product1.Id, Quantity = 50m, UnitCost = 14.50m, TotalCost = 725m },
                new() { ProductId = product2.Id, Quantity = 25m, UnitCost = 38.00m, TotalCost = 950m },
                new() { ProductId = product3.Id, Quantity = 80m, UnitCost = 11.20m, TotalCost = 896m }
            }
        };

        await context.Purchases.AddAsync(initialPurchase);

        var movements = new List<StockMovement>
        {
            new()
            {
                ProductId = product1.Id,
                Type = StockMovementType.PurchaseIn,
                Quantity = 50m,
                UnitCost = 14.50m,
                ReferenceType = "Purchase",
                ReferenceId = initialPurchase.Id,
                Reason = "Initial inventory stock in",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new()
            {
                ProductId = product2.Id,
                Type = StockMovementType.PurchaseIn,
                Quantity = 25m,
                UnitCost = 38.00m,
                ReferenceType = "Purchase",
                ReferenceId = initialPurchase.Id,
                Reason = "Initial inventory stock in",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new()
            {
                ProductId = product3.Id,
                Type = StockMovementType.PurchaseIn,
                Quantity = 80m,
                UnitCost = 11.20m,
                ReferenceType = "Purchase",
                ReferenceId = initialPurchase.Id,
                Reason = "Initial inventory stock in",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            }
        };

        await context.StockMovements.AddRangeAsync(movements);

        await context.SaveChangesAsync();
    }
}
