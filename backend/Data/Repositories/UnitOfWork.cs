using ConstructionCompanyAPI.Models;

namespace ConstructionCompanyAPI.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IRepository<Client>? _clients;
        private IRepository<Project>? _projects;
        private IRepository<Worker>? _workers;
        private IRepository<ProjectPhase>? _phases;
        private IRepository<Models.Task>? _tasks;
        private IRepository<TaskAssignment>? _taskAssignments;
        private IRepository<Supplier>? _suppliers;
        private IRepository<Material>? _materials;
        private IRepository<MaterialUsage>? _materialUsages;
        private IRepository<Equipment>? _equipment;
        private IRepository<Invoice>? _invoices;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IRepository<Client> Clients => _clients ??= new Repository<Client>(_context);
        public IRepository<Project> Projects => _projects ??= new Repository<Project>(_context);
        public IRepository<Worker> Workers => _workers ??= new Repository<Worker>(_context);
        public IRepository<ProjectPhase> ProjectPhases => _phases ??= new Repository<ProjectPhase>(_context);
        public IRepository<Models.Task> Tasks => _tasks ??= new Repository<Models.Task>(_context);
        public IRepository<TaskAssignment> TaskAssignments => _taskAssignments ??= new Repository<TaskAssignment>(_context);
        public IRepository<Supplier> Suppliers => _suppliers ??= new Repository<Supplier>(_context);
        public IRepository<Material> Materials => _materials ??= new Repository<Material>(_context);
        public IRepository<MaterialUsage> MaterialUsages => _materialUsages ??= new Repository<MaterialUsage>(_context);
        public IRepository<Equipment> Equipment => _equipment ??= new Repository<Equipment>(_context);
        public IRepository<Invoice> Invoices => _invoices ??= new Repository<Invoice>(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
