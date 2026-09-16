using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Infrastructure.Data.Configurations;

public class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
{
    public void Configure(EntityTypeBuilder<SaleItem> builder)
    {
        builder.HasKey(i => i.Id);

        builder.HasOne(i => i.Product)
            .WithMany(p => p.SaleItems)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(i => i.UnitSold)
            .HasMaxLength(16)
            .HasDefaultValue("PCS");

        builder.Property(i => i.QuantitySold)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(i => i.BaseQuantityDeducted)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);
    }
}
