using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int KlientiId { get; set; }
        public string Lokacioni { get; set; } = string.Empty;
        public decimal Buxheti { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "Planifikim"; // Planifikim, Ne Progres, I Pezulluar, I Perfunduar
        public int ProgresiTotal { get; set; } = 0;

        // Navigation properties
        public virtual Client? Client { get; set; }
        public virtual ICollection<ProjectPhase> ProjectPhases { get; set; } = new List<ProjectPhase>();
        public virtual ICollection<MaterialUsage> MaterialUsages { get; set; } = new List<MaterialUsage>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
