using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Method)
            .IsRequired();

        builder.Property(p => p.Status)
            .IsRequired();

        builder.Property(p => p.ReferenceNo)
            .HasMaxLength(100);

        builder.Property(p => p.BankName)
            .HasMaxLength(100);

        builder.Property(p => p.CheckNumber)
            .HasMaxLength(100);

        builder.Property(p => p.DishonorReason)
            .HasMaxLength(500);

        builder.HasOne(p => p.Sale)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SaleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
