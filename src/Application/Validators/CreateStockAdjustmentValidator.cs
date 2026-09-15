using FluentValidation;
using SwiftSale.Application.DTOs.Inventory;
using SwiftSale.Domain.Enums;

namespace SwiftSale.Application.Validators;

public class CreateStockAdjustmentValidator : AbstractValidator<CreateStockAdjustmentDto>
{
    public CreateStockAdjustmentValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required.");

        RuleFor(x => x.Type)
            .Must(t => t == StockMovementType.AdjustmentIn || t == StockMovementType.AdjustmentOut)
            .WithMessage("Adjustment type must be either AdjustmentIn or AdjustmentOut.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Adjustment quantity must be greater than zero.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is mandatory for all stock adjustments.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters long.")
            .MaximumLength(256).WithMessage("Reason cannot exceed 256 characters.");

        When(x => x.UnitCost.HasValue, () =>
        {
            RuleFor(x => x.UnitCost!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Unit cost cannot be negative.");
        });
    }
}
