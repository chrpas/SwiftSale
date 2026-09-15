using FluentValidation;
using SwiftSale.Application.DTOs.Sales;

namespace SwiftSale.Application.Validators;

public class CreateSaleValidator : AbstractValidator<CreateSaleDto>
{
    public CreateSaleValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("A sale must contain at least one item.");

        RuleFor(x => x.DeliveryReceiptNo)
            .MaximumLength(64).WithMessage("Delivery Receipt No. cannot exceed 64 characters.");

        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("Product ID is required for each sale item.");

            items.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            items.RuleFor(i => i.Discount)
                .GreaterThanOrEqualTo(0).WithMessage("Discount cannot be negative.");

            items.When(i => i.UnitPrice.HasValue, () =>
            {
                items.RuleFor(i => i.UnitPrice!.Value)
                    .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative.");
            });
        });

        When(x => x.Payments != null && x.Payments.Count > 0, () =>
        {
            RuleForEach(x => x.Payments!).ChildRules(payments =>
            {
                payments.RuleFor(p => p.Amount)
                    .GreaterThan(0).WithMessage("Payment amount must be greater than zero.");
            });
        });
    }
}

public class VoidSaleValidator : AbstractValidator<VoidSaleDto>
{
    public VoidSaleValidator()
    {
        RuleFor(x => x.SaleId)
            .NotEmpty().WithMessage("Sale ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is mandatory when voiding a sale.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters long.")
            .MaximumLength(256).WithMessage("Reason cannot exceed 256 characters.");
    }
}
