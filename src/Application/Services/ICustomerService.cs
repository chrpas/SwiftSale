using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwiftSale.Application.Common.Interfaces;
using SwiftSale.Application.DTOs.Customers;
using SwiftSale.Domain.Entities;
using SwiftSale.Domain.Exceptions;

namespace SwiftSale.Application.Services;

public interface ICustomerService
{
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default);
    Task<CustomerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<CustomerDto>> GetAllAsync(CancellationToken cancellationToken = default);
}

public class CustomerService : ICustomerService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreateCustomerDto> _validator;

    public CustomerService(IAppDbContext db, IValidator<CreateCustomerDto> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(dto, cancellationToken);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Phone = dto.Phone?.Trim(),
            Email = dto.Email?.Trim(),
            Address = dto.Address?.Trim()
        };

        await _db.Customers.AddAsync(customer, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new CustomerDto(
            customer.Id,
            customer.Name,
            customer.Phone,
            customer.Email,
            customer.Address,
            0
        );
    }

    public async Task<CustomerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _db.Customers
            .AsNoTracking()
            .Include(c => c.Sales)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), id);

        return new CustomerDto(
            customer.Id,
            customer.Name,
            customer.Phone,
            customer.Email,
            customer.Address,
            customer.Sales.Count
        );
    }

    public async Task<List<CustomerDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var customers = await _db.Customers
            .AsNoTracking()
            .Include(c => c.Sales)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return customers.Select(c => new CustomerDto(
            c.Id,
            c.Name,
            c.Phone,
            c.Email,
            c.Address,
            c.Sales.Count
        )).ToList();
    }
}
