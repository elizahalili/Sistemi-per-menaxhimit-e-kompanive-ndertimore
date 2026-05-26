using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Worker
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Mbiemri { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [Required]
        [MaxLength(100)]
        public string Profesioni { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal PagaDitore { get; set; }

        public DateTime DataPunesimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Aktiv"; // Aktiv, Pushim, Joaktiv

        // Navigation Properties
        public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    }
}
