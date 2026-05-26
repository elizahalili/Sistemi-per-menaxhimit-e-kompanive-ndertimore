using System.ComponentModel.DataAnnotations;

namespace ConstructionCompanyAPI.Models
{
    public class Client
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string MbiemriKompania { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [MaxLength(200)]
        public string? Adresa { get; set; }

        [Required]
        [MaxLength(50)]
        public string LlojiKlientit { get; set; } = "Individual"; // Individual or Kompani

        // Navigation Properties
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
