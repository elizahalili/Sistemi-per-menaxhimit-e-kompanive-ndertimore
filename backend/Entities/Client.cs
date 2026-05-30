using System.Collections.Generic;

namespace backend.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string MbiemriKompania { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string LlojiKlientit { get; set; } = string.Empty; // "Individual" or "Kompani"

        // Navigation properties
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
