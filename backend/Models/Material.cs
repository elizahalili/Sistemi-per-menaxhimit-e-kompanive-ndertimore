using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string NjesiaMatese { get; set; } = "Cope"; // Cope, m3, kg, litra, etj.

        [Column(TypeName = "decimal(18,2)")]
        public decimal CmimiNjesi { get; set; }

        [Required]
        public int FurnitoriId { get; set; }

        [ForeignKey("FurnitoriId")]
        public Supplier? Supplier { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SasiaStokut { get; set; } = 0;

        [MaxLength(100)]
        public string? Kategoria { get; set; }

        // Navigation Properties
        public ICollection<MaterialUsage> Usages { get; set; } = new List<MaterialUsage>();
    }
}
