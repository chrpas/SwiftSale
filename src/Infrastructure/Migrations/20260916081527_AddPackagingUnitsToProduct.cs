using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwiftSale.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPackagingUnitsToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "Products");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Products",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PiecesPerBox",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "UnitIdentifier",
                table: "Products",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "PCS");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "PiecesPerBox",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "UnitIdentifier",
                table: "Products");

            migrationBuilder.AddColumn<string>(
                name: "UnitId",
                table: "Products",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);
        }
    }
}
