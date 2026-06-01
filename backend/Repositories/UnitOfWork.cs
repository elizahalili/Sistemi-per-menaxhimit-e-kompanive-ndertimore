using Microsoft.EntityFrameworkCore.Storage;
using backend.Data;
using backend.Entities;

namespace backend.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        public IGenericRepository<Client> Clients { get; }
        public IGenericRepository<Project> Projects { get; }
        public IGenericRepository<Worker> Workers { get; }
        public IGenericRepository<ProjectPhase> ProjectPhases { get; }
        public IGenericRepository<backend.Entities.Task> Tasks { get; }
        public IGenericRepository<TaskAssignment> TaskAssignments { get; }
        public IGenericRepository<Supplier> Suppliers { get; }
        public IGenericRepository<Material> Materials { get; }
        public IGenericRepository<MaterialUsage> MaterialUsages { get; }
        public IGenericRepository<Equipment> Equipment { get; }
        public IGenericRepository<Invoice> Invoices { get; }
        public IGenericRepository<RefreshToken> RefreshTokens { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Clients = new GenericRepository<Client>(_context);
            Projects = new GenericRepository<Project>(_context);
            Workers = new GenericRepository<Worker>(_context);
            ProjectPhases = new GenericRepository<ProjectPhase>(_context);
            Tasks = new GenericRepository<backend.Entities.Task>(_context);
            TaskAssignments = new GenericRepository<TaskAssignment>(_context);
            Suppliers = new GenericRepository<Supplier>(_context);
            Materials = new GenericRepository<Material>(_context);
            MaterialUsages = new GenericRepository<MaterialUsage>(_context);
            Equipment = new GenericRepository<Equipment>(_context);
            Invoices = new GenericRepository<Invoice>(_context);
            RefreshTokens = new GenericRepository<RefreshToken>(_context);
        }

        public async System.Threading.Tasks.Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async System.Threading.Tasks.Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async System.Threading.Tasks.Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _context.Dispose();
            _transaction?.Dispose();
        }
    }
}
