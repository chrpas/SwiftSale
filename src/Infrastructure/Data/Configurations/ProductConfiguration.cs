using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(p => p.SKU)
            .IsUnique();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(p => p.UnitIdentifier)
            .IsRequired()
            .HasMaxLength(32)
            .HasDefaultValue("PCS");

        builder.Property(p => p.PiecesPerBox)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Ignore(p => p.UnitId);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.InventoryBalance)
            .WithOne(b => b.Product)
            .HasForeignKey<InventoryBalance>(b => b.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
