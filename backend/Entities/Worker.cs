using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class Worker
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string Mbiemri { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Profesioni { get; set; } = string.Empty;
        public decimal PagaDitore { get; set; }
        public DateTime DataPunesimit { get; set; }
        public string Statusi { get; set; } = "Aktiv"; // Aktiv, Pushim, etj.

        // Navigation properties
        public virtual ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    }
}
