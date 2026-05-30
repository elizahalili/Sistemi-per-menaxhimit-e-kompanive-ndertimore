using System.Collections.Generic;

namespace backend.Entities
{
    public class Material
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string NjesiaMatese { get; set; } = string.Empty;
        public decimal CmimiNjesi { get; set; }
        public int FurnitoriId { get; set; }
        public double SasiaStokut { get; set; }
        public string Kategoria { get; set; } = string.Empty;

        // Navigation properties
        public virtual Supplier? Supplier { get; set; }
        public virtual ICollection<MaterialUsage> MaterialUsages { get; set; } = new List<MaterialUsage>();
    }
}
