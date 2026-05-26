using System.ComponentModel.DataAnnotations;

namespace ConstructionCompanyAPI.Models
{
    public class Supplier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Kontakti { get; set; }

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [MaxLength(200)]
        public string? Adresa { get; set; }

        [MaxLength(100)]
        public string? Specialiteti { get; set; }

        // Navigation Properties
        public ICollection<Material> Materials { get; set; } = new List<Material>();
    }
}
