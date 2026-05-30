using System.Collections.Generic;

namespace backend.Entities
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Kontakti { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string Specialiteti { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Material> Materials { get; set; } = new List<Material>();
    }
}
