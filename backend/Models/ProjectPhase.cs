using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class ProjectPhase
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjektiId { get; set; }

        [ForeignKey("ProjektiId")]
        public Project? Project { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        public int Rendi { get; set; } // Phase order sequence

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "E paplanifikuar"; // E paplanifikuar, Ne Progres, E perfunduar

        [Column(TypeName = "decimal(5,2)")]
        public decimal PerqindjaKompletimit { get; set; } = 0;

        // Navigation Properties
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public ICollection<MaterialUsage> MaterialUsages { get; set; } = new List<MaterialUsage>();
    }
}
