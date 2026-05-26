using ConstructionCompanyAPI.Models;

namespace ConstructionCompanyAPI.Data.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Client> Clients { get; }
        IRepository<Project> Projects { get; }
        IRepository<Worker> Workers { get; }
        IRepository<ProjectPhase> ProjectPhases { get; }
        IRepository<Models.Task> Tasks { get; }
        IRepository<TaskAssignment> TaskAssignments { get; }
        IRepository<Supplier> Suppliers { get; }
        IRepository<Material> Materials { get; }
        IRepository<MaterialUsage> MaterialUsages { get; }
        IRepository<Equipment> Equipment { get; }
        IRepository<Invoice> Invoices { get; }
        
        Task<int> CompleteAsync();
    }
}
