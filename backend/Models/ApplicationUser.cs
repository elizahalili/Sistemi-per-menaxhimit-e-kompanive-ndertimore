using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ConstructionCompanyAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Mbiemri { get; set; } = string.Empty;

        public DateTime DataKrijimit { get; set; } = DateTime.UtcNow;
        
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
