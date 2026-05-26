using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class MaterialUsage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjektiId { get; set; }

        [ForeignKey("ProjektiId")]
        public Project? Project { get; set; }

        [Required]
        public int MaterialiId { get; set; }

        [ForeignKey("MaterialiId")]
        public Material? Material { get; set; }

        [Required]
        public int FazaId { get; set; }

        [ForeignKey("FazaId")]
        public ProjectPhase? Phase { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Sasia { get; set; }

        public DateTime DataPerdorimit { get; set; } = DateTime.UtcNow;
    }
}
