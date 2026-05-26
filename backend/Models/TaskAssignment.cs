using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class TaskAssignment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DetyraId { get; set; }

        [ForeignKey("DetyraId")]
        public Task? Task { get; set; }

        [Required]
        public int PunetoriId { get; set; }

        [ForeignKey("PunetoriId")]
        public Worker? Worker { get; set; }

        public DateTime DataCaktimit { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal OretPunuara { get; set; } = 0;
    }
}
