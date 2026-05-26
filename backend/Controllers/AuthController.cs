using ConstructionCompanyAPI.DTOs;
using ConstructionCompanyAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionCompanyAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(request);
            if (result == null)
            {
                return BadRequest(new { Message = "Regjistrimi dështoi. Email-i mund të jetë i përdorur ose fjalëkalimi i pasigurt." });
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { Message = "Email-i ose fjalëkalimi është gabim." });
            }

            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _authService.RefreshTokenAsync(request);
            if (result == null)
            {
                return BadRequest(new { Message = "Token-i i rifreskimit është i pavlefshëm ose ka skaduar." });
            }

            return Ok(result);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            await _authService.SeedRolesAndAdminAsync();
            return Ok(new { Message = "Rolet dhe llogaria Admin u krijuan me sukses!" });
        }
    }
}
