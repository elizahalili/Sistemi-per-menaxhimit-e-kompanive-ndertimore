using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace backend.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string Emri { get; set; } = string.Empty;
        public string Mbiemri { get; set; } = string.Empty;
        
        // Navigation properties
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
