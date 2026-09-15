using Microsoft.EntityFrameworkCore.Storage;
using SwiftSale.Application.Common.Interfaces;

namespace SwiftSale.Infrastructure.Data;

public class EfDbTransaction : IDbTransaction
{
    private readonly IDbContextTransaction _transaction;

    public EfDbTransaction(IDbContextTransaction transaction)
    {
        _transaction = transaction;
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        await _transaction.CommitAsync(cancellationToken);
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        await _transaction.RollbackAsync(cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        await _transaction.DisposeAsync();
    }
}
