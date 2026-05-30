using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class ProjectPhase
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int Rendi { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "E paplanifikuar"; // E paplanifikuar, Ne Progres, E perfunduar
        public int PerqindjaKompletimit { get; set; } = 0;

        // Navigation properties
        public virtual Project? Project { get; set; }
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        public virtual ICollection<MaterialUsage> MaterialUsages { get; set; } = new List<MaterialUsage>();
    }
}
