using ConstructionCompanyAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ConstructionCompanyAPI.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Worker> Workers { get; set; } = null!;
        public DbSet<ProjectPhase> ProjectPhases { get; set; } = null!;
        public DbSet<Models.Task> Tasks { get; set; } = null!;
        public DbSet<TaskAssignment> TaskAssignments { get; set; } = null!;
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Material> Materials { get; set; } = null!;
        public DbSet<MaterialUsage> MaterialUsages { get; set; } = null!;
        public DbSet<Equipment> Equipment { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Cascade rules & decimal precisions

            // Project - Client relationship
            builder.Entity<Project>()
                .HasOne(p => p.Client)
                .WithMany(c => c.Projects)
                .HasForeignKey(p => p.KlientiId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invoice - Project relationship
            builder.Entity<Invoice>()
                .HasOne(i => i.Project)
                .WithMany(p => p.Invoices)
                .HasForeignKey(i => i.ProjektiId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invoice - Client relationship
            builder.Entity<Invoice>()
                .HasOne(i => i.Client)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.KlientiId)
                .OnDelete(DeleteBehavior.Restrict);

            // ProjectPhase - Project relationship
            builder.Entity<ProjectPhase>()
                .HasOne(pp => pp.Project)
                .WithMany(p => p.Phases)
                .HasForeignKey(pp => pp.ProjektiId)
                .OnDelete(DeleteBehavior.Cascade);

            // Task - ProjectPhase relationship
            builder.Entity<Models.Task>()
                .HasOne(t => t.Phase)
                .WithMany(pp => pp.Tasks)
                .HasForeignKey(t => t.FazaId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskAssignment - Task relationship
            builder.Entity<TaskAssignment>()
                .HasOne(ta => ta.Task)
                .WithMany(t => t.Assignments)
                .HasForeignKey(ta => ta.DetyraId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskAssignment - Worker relationship
            builder.Entity<TaskAssignment>()
                .HasOne(ta => ta.Worker)
                .WithMany(w => w.Assignments)
                .HasForeignKey(ta => ta.PunetoriId)
                .OnDelete(DeleteBehavior.Restrict);

            // Material - Supplier relationship
            builder.Entity<Material>()
                .HasOne(m => m.Supplier)
                .WithMany(s => s.Materials)
                .HasForeignKey(m => m.FurnitoriId)
                .OnDelete(DeleteBehavior.Restrict);

            // MaterialUsage - Project relationship
            builder.Entity<MaterialUsage>()
                .HasOne(mu => mu.Project)
                .WithMany(p => p.MaterialUsages)
                .HasForeignKey(mu => mu.ProjektiId)
                .OnDelete(DeleteBehavior.Restrict);

            // MaterialUsage - Material relationship
            builder.Entity<MaterialUsage>()
                .HasOne(mu => mu.Material)
                .WithMany(m => m.Usages)
                .HasForeignKey(mu => mu.MaterialiId)
                .OnDelete(DeleteBehavior.Restrict);

            // MaterialUsage - ProjectPhase relationship
            builder.Entity<MaterialUsage>()
                .HasOne(mu => mu.Phase)
                .WithMany(pp => pp.MaterialUsages)
                .HasForeignKey(mu => mu.FazaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Set Index naming convention to avoid clashes in MySQL
            builder.Entity<ApplicationUser>()
                .HasMany(u => u.RefreshTokens)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
