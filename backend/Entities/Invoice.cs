using System;

namespace backend.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public int KlientiId { get; set; }
        public decimal Shuma { get; set; }
        public string Pershkrimi { get; set; } = string.Empty;
        public DateTime DataFatures { get; set; }
        public DateTime? DataPageses { get; set; }
        public string Statusi { get; set; } = "E papaguar"; // E paguar, E papaguar, E vonuar

        // Navigation properties
        public virtual Project? Project { get; set; }
        public virtual Client? Client { get; set; }
    }
}
