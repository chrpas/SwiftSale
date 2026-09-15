using SwiftSale.Application.Common.Interfaces;

namespace SwiftSale.Infrastructure.Data;

public class NoOpDbTransaction : IDbTransaction
{
    public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}
