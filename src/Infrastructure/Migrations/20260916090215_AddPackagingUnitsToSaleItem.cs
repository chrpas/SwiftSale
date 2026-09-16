using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwiftSale.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPackagingUnitsToSaleItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantityDeducted",
                table: "SaleItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantitySold",
                table: "SaleItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "UnitSold",
                table: "SaleItems",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "PCS");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BaseQuantityDeducted",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "QuantitySold",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "UnitSold",
                table: "SaleItems");
        }
    }
}
