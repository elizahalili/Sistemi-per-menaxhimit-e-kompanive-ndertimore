using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class Task
    {
        public int Id { get; set; }
        public int FazaId { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public string Prioriteti { get; set; } = "Mesatar"; // I ulet, Mesatar, I larte
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "E paplanifikuar"; // E paplanifikuar, Ne Progres, E perfunduar

        // Navigation properties
        public virtual ProjectPhase? ProjectPhase { get; set; }
        public virtual ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    }
}
