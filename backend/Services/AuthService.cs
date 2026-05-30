using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IUnitOfWork unitOfWork,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                throw new UnauthorizedAccessException("Emaili ose fjalëkalimi është i pasaktë.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.Count > 0 ? roles[0] : "Worker";

            var accessToken = GenerateAccessToken(user, role);
            var refreshToken = GenerateRefreshToken();

            // Save refresh token to db
            var dbToken = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(dbToken);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Emri = user.Emri,
                    Mbiemri = user.Mbiemri,
                    Email = user.Email ?? string.Empty,
                    Role = role
                }
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Një përdorues me këtë email ekziston tashmë.");
            }

            var user = new ApplicationUser
            {
                Emri = registerDto.Emri,
                Mbiemri = registerDto.Mbiemri,
                Email = registerDto.Email,
                UserName = registerDto.Email
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                throw new InvalidOperationException($"Dështoi krijimi i llogarisë: {errors}");
            }

            // Ensure role exists and assign it
            var targetRole = string.IsNullOrEmpty(registerDto.Role) ? "Worker" : registerDto.Role;
            if (!await _roleManager.RoleExistsAsync(targetRole))
            {
                await _roleManager.CreateAsync(new ApplicationRole(targetRole));
            }

            await _userManager.AddToRoleAsync(user, targetRole);

            var accessToken = GenerateAccessToken(user, targetRole);
            var refreshToken = GenerateRefreshToken();

            // Save refresh token
            var dbToken = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(dbToken);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Emri = user.Emri,
                    Mbiemri = user.Mbiemri,
                    Email = user.Email ?? string.Empty,
                    Role = targetRole
                }
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string token)
        {
            var dbToken = await _unitOfWork.RefreshTokens.GetQueryable()
                .Include(x => x.User)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (dbToken == null || !dbToken.IsActive)
            {
                throw new UnauthorizedAccessException("Refresh token i pavlefshëm ose i skaduar.");
            }

            // Revoke current token
            dbToken.IsRevoked = true;
            _unitOfWork.RefreshTokens.Update(dbToken);

            var user = dbToken.User;
            if (user == null)
            {
                throw new UnauthorizedAccessException("Përdoruesi nuk ekziston.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.Count > 0 ? roles[0] : "Worker";

            var newAccessToken = GenerateAccessToken(user, role);
            var newRefreshToken = GenerateRefreshToken();

            var newDbToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(newDbToken);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Emri = user.Emri,
                    Mbiemri = user.Mbiemri,
                    Email = user.Email ?? string.Empty,
                    Role = role
                }
            };
        }

        public async Task<bool> RevokeTokenAsync(string token)
        {
            var dbToken = await _unitOfWork.RefreshTokens.GetQueryable()
                .FirstOrDefaultAsync(t => t.Token == token);

            if (dbToken == null || !dbToken.IsActive)
            {
                return false;
            }

            dbToken.IsRevoked = true;
            _unitOfWork.RefreshTokens.Update(dbToken);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        private string GenerateAccessToken(ApplicationUser user, string role)
        {
            var securityKeyString = _configuration["JwtSettings:SecurityKey"] ?? "AntigravitySuperSecureKeyConstructionAPI2026";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "ConstructionAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "ConstructionFrontend";
            var expiryMin = Convert.ToInt32(_configuration["JwtSettings:ExpiryInMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKeyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, role),
                new Claim("emri", user.Emri),
                new Claim("mbiemri", user.Mbiemri)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMin),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
