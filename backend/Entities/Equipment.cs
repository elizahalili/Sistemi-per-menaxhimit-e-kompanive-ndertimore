using System;

namespace backend.Entities
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Lloji { get; set; } = string.Empty;
        public string Statusi { get; set; } = "I Lire"; // Ne Pune, I Lire, Mirembajtje
        public decimal KostojaDitore { get; set; }
        public DateTime DataBlerjes { get; set; }
    }
}
