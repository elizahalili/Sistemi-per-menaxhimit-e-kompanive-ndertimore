using System;

namespace backend.Entities
{
    public class MaterialUsage
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public int MaterialiId { get; set; }
        public double Sasia { get; set; }
        public DateTime DataPerdorimit { get; set; }
        public int FazaId { get; set; }

        // Navigation properties
        public virtual Project? Project { get; set; }
        public virtual Material? Material { get; set; }
        public virtual ProjectPhase? ProjectPhase { get; set; }
    }
}
