using System.Threading.Tasks;
using backend.Entities;

namespace backend.Services
{
    public interface IMaterialUsageService
    {
        Task<MaterialUsage> CreateUsageAsync(MaterialUsage usage);
        Task<MaterialUsage> UpdateUsageAsync(int id, MaterialUsage usage);
        Task<bool> DeleteUsageAsync(int id);
    }
}
