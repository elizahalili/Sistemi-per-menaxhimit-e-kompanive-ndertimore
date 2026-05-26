using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Task
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FazaId { get; set; }

        [ForeignKey("FazaId")]
        public ProjectPhase? Phase { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        [MaxLength(50)]
        public string Prioriteti { get; set; } = "Mesatar"; // I ulet, Mesatar, I larte

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Pa filluar"; // Pa filluar, Ne Progres, E bllokuar, E perfunduar

        // Navigation Properties
        public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    }
}
