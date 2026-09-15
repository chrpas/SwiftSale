using FluentValidation;
using SwiftSale.Application.DTOs.Purchases;

namespace SwiftSale.Application.Validators;

public class CreatePurchaseValidator : AbstractValidator<CreatePurchaseDto>
{
    public CreatePurchaseValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("Supplier ID is required.");

        RuleFor(x => x.ReferenceNo)
            .NotEmpty().WithMessage("Purchase Reference number is required.")
            .MaximumLength(64).WithMessage("Reference number cannot exceed 64 characters.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Purchase must contain at least one item.");

        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("Product ID is required for each purchase item.");

            items.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Purchase quantity must be greater than zero.");

            items.RuleFor(i => i.UnitCost)
                .GreaterThanOrEqualTo(0).WithMessage("Unit cost cannot be negative.");
        });
    }
}
