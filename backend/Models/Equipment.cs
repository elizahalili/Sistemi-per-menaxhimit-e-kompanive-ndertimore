using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Equipment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Lloji { get; set; } = string.Empty; // Heavy, Tools, Vehicles

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "I Lire"; // Ne Pune, Mirembajtje, I Lire

        [Column(TypeName = "decimal(18,2)")]
        public decimal KostojaDitore { get; set; }

        public DateTime DataBlerjes { get; set; }
    }
}
