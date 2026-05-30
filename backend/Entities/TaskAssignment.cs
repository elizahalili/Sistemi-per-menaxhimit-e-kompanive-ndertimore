using System;

namespace backend.Entities
{
    public class TaskAssignment
    {
        public int Id { get; set; }
        public int DetyraId { get; set; }
        public int PunetoriId { get; set; }
        public DateTime DataCaktimit { get; set; }
        public double OretPunuara { get; set; }

        // Navigation properties
        public virtual Task? Task { get; set; }
        public virtual Worker? Worker { get; set; }
    }
}
