using System;
using System.Threading.Tasks;
using backend.Entities;
using backend.Repositories;

namespace backend.Services
{
    public class MaterialUsageService : IMaterialUsageService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MaterialUsageService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MaterialUsage> CreateUsageAsync(MaterialUsage usage)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var material = await _unitOfWork.Materials.GetByIdAsync(usage.MaterialiId);
                if (material == null)
                {
                    throw new ArgumentException("Materiali i zgjedhur nuk ekziston.");
                }

                if (material.SasiaStokut < usage.Sasia)
                {
                    throw new InvalidOperationException($"Sasi e pamjaftueshme në stok. Stoku aktual: {material.SasiaStokut} {material.NjesiaMatese}.");
                }

                // Decrement inventory
                material.SasiaStokut = Math.Round(material.SasiaStokut - usage.Sasia, 2);
                _unitOfWork.Materials.Update(material);

                await _unitOfWork.MaterialUsages.AddAsync(usage);
                await _unitOfWork.CompleteAsync();
                
                await _unitOfWork.CommitTransactionAsync();
                return usage;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<MaterialUsage> UpdateUsageAsync(int id, MaterialUsage usage)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var existingUsage = await _unitOfWork.MaterialUsages.GetByIdAsync(id);
                if (existingUsage == null)
                {
                    throw new ArgumentException("Përdorimi i materialit nuk ekziston.");
                }

                var material = await _unitOfWork.Materials.GetByIdAsync(usage.MaterialiId);
                if (material == null)
                {
                    throw new ArgumentException("Materiali i zgjedhur nuk ekziston.");
                }

                double difference = usage.Sasia - existingUsage.Sasia;

                if (material.SasiaStokut < difference)
                {
                    throw new InvalidOperationException($"Sasi e pamjaftueshme në stok për përditësimin. Stoku aktual: {material.SasiaStokut} {material.NjesiaMatese}.");
                }

                // Update stock level
                material.SasiaStokut = Math.Round(material.SasiaStokut - difference, 2);
                _unitOfWork.Materials.Update(material);

                // Update fields
                existingUsage.ProjektiId = usage.ProjektiId;
                existingUsage.MaterialiId = usage.MaterialiId;
                existingUsage.FazaId = usage.FazaId;
                existingUsage.Sasia = usage.Sasia;
                existingUsage.DataPerdorimit = usage.DataPerdorimit;

                _unitOfWork.MaterialUsages.Update(existingUsage);
                await _unitOfWork.CompleteAsync();

                await _unitOfWork.CommitTransactionAsync();
                return existingUsage;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool> DeleteUsageAsync(int id)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var usage = await _unitOfWork.MaterialUsages.GetByIdAsync(id);
                if (usage == null)
                {
                    return false;
                }

                var material = await _unitOfWork.Materials.GetByIdAsync(usage.MaterialiId);
                if (material != null)
                {
                    // Restore stock level
                    material.SasiaStokut = Math.Round(material.SasiaStokut + usage.Sasia, 2);
                    _unitOfWork.Materials.Update(material);
                }

                _unitOfWork.MaterialUsages.Delete(usage);
                await _unitOfWork.CompleteAsync();

                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
