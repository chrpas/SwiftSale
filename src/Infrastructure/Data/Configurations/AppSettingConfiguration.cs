using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftSale.Domain.Entities;

namespace SwiftSale.Infrastructure.Data.Configurations;

public class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.ToTable("AppSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Key)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Value)
            .HasMaxLength(2000);

        builder.Property(s => s.UpdatedAt)
            .IsRequired();

        // Enforce uniqueness — one row per key
        builder.HasIndex(s => s.Key)
            .IsUnique()
            .HasDatabaseName("IX_AppSettings_Key");
    }
}
