using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using backend.Entities;

namespace backend.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<ProjectPhase> ProjectPhases { get; set; }
        public DbSet<backend.Entities.Task> Tasks { get; set; }
        public DbSet<TaskAssignment> TaskAssignments { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<MaterialUsage> MaterialUsages { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. Identity mappings
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable("Users");
            });

            builder.Entity<ApplicationRole>(entity =>
            {
                entity.ToTable("Roles");
            });

            builder.Entity<IdentityUserRole<int>>(entity =>
            {
                entity.ToTable("UserRoles");
            });

            builder.Entity<IdentityUserClaim<int>>(entity =>
            {
                entity.ToTable("UserClaims");
            });

            builder.Entity<IdentityUserToken<int>>(entity =>
            {
                entity.ToTable("UserTokens");
            });

            builder.Entity<IdentityUserLogin<int>>(entity =>
            {
                entity.ToTable("UserLogins");
            });

            builder.Entity<IdentityRoleClaim<int>>(entity =>
            {
                entity.ToTable("RoleClaims");
            });

            // 2. RefreshToken mapping
            builder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("RefreshTokens");
                entity.HasOne(rt => rt.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 3. Client & Project Mapping
            builder.Entity<Client>(entity =>
            {
                entity.ToTable("Clients");
                entity.Property(c => c.Emri).HasMaxLength(100).IsRequired();
                entity.Property(c => c.MbiemriKompania).HasMaxLength(150).IsRequired();
            });

            builder.Entity<Project>(entity =>
            {
                entity.ToTable("Projects");
                entity.Property(p => p.Emertimi).HasMaxLength(150).IsRequired();
                entity.HasOne(p => p.Client)
                    .WithMany(c => c.Projects)
                    .HasForeignKey(p => p.KlientiId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // 4. Worker & ProjectPhase
            builder.Entity<Worker>(entity =>
            {
                entity.ToTable("Workers");
                entity.Property(w => w.Emri).HasMaxLength(100).IsRequired();
                entity.Property(w => w.Mbiemri).HasMaxLength(100).IsRequired();
            });

            builder.Entity<ProjectPhase>(entity =>
            {
                entity.ToTable("ProjectPhases");
                entity.Property(pp => pp.Emertimi).HasMaxLength(150).IsRequired();
                entity.HasOne(pp => pp.Project)
                    .WithMany(p => p.ProjectPhases)
                    .HasForeignKey(pp => pp.ProjektiId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 5. Tasks & TaskAssignments
            builder.Entity<backend.Entities.Task>(entity =>
            {
                entity.ToTable("Tasks");
                entity.Property(t => t.Emertimi).HasMaxLength(150).IsRequired();
                entity.HasOne(t => t.ProjectPhase)
                    .WithMany(pp => pp.Tasks)
                    .HasForeignKey(t => t.FazaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TaskAssignment>(entity =>
            {
                entity.ToTable("TaskAssignments");
                entity.HasOne(ta => ta.Task)
                    .WithMany(t => t.TaskAssignments)
                    .HasForeignKey(ta => ta.DetyraId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ta => ta.Worker)
                    .WithMany(w => w.TaskAssignments)
                    .HasForeignKey(ta => ta.PunetoriId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 6. Suppliers & Materials
            builder.Entity<Supplier>(entity =>
            {
                entity.ToTable("Suppliers");
                entity.Property(s => s.Emertimi).HasMaxLength(150).IsRequired();
            });

            builder.Entity<Material>(entity =>
            {
                entity.ToTable("Materials");
                entity.Property(m => m.Emertimi).HasMaxLength(150).IsRequired();
                entity.HasOne(m => m.Supplier)
                    .WithMany(s => s.Materials)
                    .HasForeignKey(m => m.FurnitoriId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // 7. MaterialUsages
            builder.Entity<MaterialUsage>(entity =>
            {
                entity.ToTable("MaterialUsages");
                entity.HasOne(mu => mu.Project)
                    .WithMany(p => p.MaterialUsages)
                    .HasForeignKey(mu => mu.ProjektiId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mu => mu.Material)
                    .WithMany(m => m.MaterialUsages)
                    .HasForeignKey(mu => mu.MaterialiId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mu => mu.ProjectPhase)
                    .WithMany(pp => pp.MaterialUsages)
                    .HasForeignKey(mu => mu.FazaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 8. Equipment
            builder.Entity<Equipment>(entity =>
            {
                entity.ToTable("Equipment");
                entity.Property(e => e.Emertimi).HasMaxLength(150).IsRequired();
            });

            // 9. Invoices
            builder.Entity<Invoice>(entity =>
            {
                entity.ToTable("Invoices");
                entity.HasOne(i => i.Project)
                    .WithMany(p => p.Invoices)
                    .HasForeignKey(i => i.ProjektiId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.Client)
                    .WithMany(c => c.Invoices)
                    .HasForeignKey(i => i.KlientiId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
