using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        public int KlientiId { get; set; }

        [ForeignKey("KlientiId")]
        public Client? Client { get; set; }

        [MaxLength(200)]
        public string? Lokacioni { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Buxheti { get; set; }

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Planifikim"; // Planifikim, Ne Progres, I Pezulluar, I Perfunduar

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgresiTotal { get; set; } = 0;

        // Navigation Properties
        public ICollection<ProjectPhase> Phases { get; set; } = new List<ProjectPhase>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<MaterialUsage> MaterialUsages { get; set; } = new List<MaterialUsage>();
    }
}
