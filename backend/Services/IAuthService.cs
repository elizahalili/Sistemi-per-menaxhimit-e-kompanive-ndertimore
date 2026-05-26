using ConstructionCompanyAPI.DTOs;

namespace ConstructionCompanyAPI.Services
{
    public interface IAuthService
    {
        Task<TokenResponse?> RegisterAsync(RegisterRequest request);
        Task<TokenResponse?> LoginAsync(LoginRequest request);
        Task<TokenResponse?> RefreshTokenAsync(RefreshRequest request);
        Task SeedRolesAndAdminAsync();
    }
}
