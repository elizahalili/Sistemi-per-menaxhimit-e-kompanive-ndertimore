using System;
using backend.Entities;

namespace backend.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Client> Clients { get; }
        IGenericRepository<Project> Projects { get; }
        IGenericRepository<Worker> Workers { get; }
        IGenericRepository<ProjectPhase> ProjectPhases { get; }
        IGenericRepository<backend.Entities.Task> Tasks { get; }
        IGenericRepository<TaskAssignment> TaskAssignments { get; }
        IGenericRepository<Supplier> Suppliers { get; }
        IGenericRepository<Material> Materials { get; }
        IGenericRepository<MaterialUsage> MaterialUsages { get; }
        IGenericRepository<Equipment> Equipment { get; }
        IGenericRepository<Invoice> Invoices { get; }
        IGenericRepository<RefreshToken> RefreshTokens { get; }

        System.Threading.Tasks.Task<int> CompleteAsync();
        System.Threading.Tasks.Task BeginTransactionAsync();
        System.Threading.Tasks.Task CommitTransactionAsync();
        System.Threading.Tasks.Task RollbackTransactionAsync();
    }
}
