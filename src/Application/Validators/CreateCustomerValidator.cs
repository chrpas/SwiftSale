using FluentValidation;
using SwiftSale.Application.DTOs.Customers;

namespace SwiftSale.Application.Validators;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Customer name is required.")
            .MaximumLength(256).WithMessage("Customer name cannot exceed 256 characters.");

        When(x => !string.IsNullOrEmpty(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("A valid email address is required.");
        });

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .MaximumLength(32).WithMessage("Phone number cannot exceed 32 characters.");
        });
    }
}
