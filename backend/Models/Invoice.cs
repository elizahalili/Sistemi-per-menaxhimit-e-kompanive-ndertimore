using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionCompanyAPI.Models
{
    public class Invoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjektiId { get; set; }

        [ForeignKey("ProjektiId")]
        public Project? Project { get; set; }

        [Required]
        public int KlientiId { get; set; }

        [ForeignKey("KlientiId")]
        public Client? Client { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Shuma { get; set; }

        public string? Pershkrimi { get; set; }

        public DateTime DataFatures { get; set; } = DateTime.UtcNow;

        public DateTime? DataPageses { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "E papaguar"; // E papaguar, E paguar, E vonuar
    }
}
