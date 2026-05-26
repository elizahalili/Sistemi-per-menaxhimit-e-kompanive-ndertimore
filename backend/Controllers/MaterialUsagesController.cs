using AutoMapper;
using ConstructionCompanyAPI.Data.Repositories;
using ConstructionCompanyAPI.DTOs;
using ConstructionCompanyAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionCompanyAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialUsagesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaterialUsagesController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? projektiId,
            [FromQuery] int? materialiId,
            [FromQuery] int? fazaId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _unitOfWork.MaterialUsages.Query()
                .Include(mu => mu.Project)
                .Include(mu => mu.Material)
                .Include(mu => mu.Phase)
                .AsQueryable();

            if (projektiId.HasValue)
            {
                query = query.Where(mu => mu.ProjektiId == projektiId.Value);
            }

            if (materialiId.HasValue)
            {
                query = query.Where(mu => mu.MaterialiId == materialiId.Value);
            }

            if (fazaId.HasValue)
            {
                query = query.Where(mu => mu.FazaId == fazaId.Value);
            }

            query = query.OrderByDescending(mu => mu.Id);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialUsageDto>>(items);

            return Ok(new
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var usage = await _unitOfWork.MaterialUsages.Query()
                .Include(mu => mu.Project)
                .Include(mu => mu.Material)
                .Include(mu => mu.Phase)
                .FirstOrDefaultAsync(mu => mu.Id == id);

            if (usage == null) return NotFound(new { Message = "Përdorimi i materialit nuk u gjet." });
            return Ok(_mapper.Map<MaterialUsageDto>(usage));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] MaterialUsageCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjektiId);
            if (project == null) return BadRequest(new { Message = "Projekti nuk ekziston." });

            var material = await _unitOfWork.Materials.GetByIdAsync(dto.MaterialiId);
            if (material == null) return BadRequest(new { Message = "Materiali nuk ekziston." });

            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(dto.FazaId);
            if (phase == null) return BadRequest(new { Message = "Faza e projektit nuk ekziston." });

            // Check if stock is sufficient
            if (material.SasiaStokut < dto.Sasia)
            {
                return BadRequest(new { Message = $"Sasi e pamjaftueshme në stok. Stoku aktual: {material.SasiaStokut} {material.NjesiaMatese}." });
            }

            // Deduct from stock
            material.SasiaStokut -= dto.Sasia;
            _unitOfWork.Materials.Update(material);

            var usage = _mapper.Map<MaterialUsage>(dto);
            await _unitOfWork.MaterialUsages.AddAsync(usage);
            await _unitOfWork.CompleteAsync();

            var created = await _unitOfWork.MaterialUsages.Query()
                .Include(mu => mu.Project)
                .Include(mu => mu.Material)
                .Include(mu => mu.Phase)
                .FirstOrDefaultAsync(mu => mu.Id == usage.Id);

            return CreatedAtAction(nameof(GetById), new { id = usage.Id }, _mapper.Map<MaterialUsageDto>(created));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var usage = await _unitOfWork.MaterialUsages.Query()
                .Include(mu => mu.Material)
                .FirstOrDefaultAsync(mu => mu.Id == id);

            if (usage == null) return NotFound(new { Message = "Përdorimi i materialit nuk u gjet." });

            // Return quantity to stock
            if (usage.Material != null)
            {
                usage.Material.SasiaStokut += usage.Sasia;
                _unitOfWork.Materials.Update(usage.Material);
            }

            _unitOfWork.MaterialUsages.Delete(usage);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Përdorimi i materialit u fshi dhe stoku u përditësua." });
        }
    }
}
