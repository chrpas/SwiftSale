using SwiftSale.Domain.Entities;

namespace SwiftSale.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
