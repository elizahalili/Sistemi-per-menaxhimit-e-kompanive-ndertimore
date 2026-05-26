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
    public class MaterialsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaterialsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? kategoria,
            [FromQuery] bool? lowStock,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Materials.Query().Include(m => m.Supplier).AsQueryable();

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(m => m.Emertimi.ToLower().Contains(s) || 
                                         (m.Kategoria != null && m.Kategoria.ToLower().Contains(s)) ||
                                         m.Supplier!.Emertimi.ToLower().Contains(s));
            }

            // Category filter
            if (!string.IsNullOrEmpty(kategoria))
            {
                query = query.Where(m => m.Kategoria == kategoria);
            }

            // Low Stock alert threshold (e.g. stock <= 20)
            if (lowStock.HasValue && lowStock.Value)
            {
                query = query.Where(m => m.SasiaStokut <= 20);
            }

            // Sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "emertimi":
                        query = isDesc ? query.OrderByDescending(m => m.Emertimi) : query.OrderBy(m => m.Emertimi);
                        break;
                    case "cmimi":
                    case "cmiminjesi":
                        query = isDesc ? query.OrderByDescending(m => m.CmimiNjesi) : query.OrderBy(m => m.CmimiNjesi);
                        break;
                    case "stoku":
                    case "sasiastokut":
                        query = isDesc ? query.OrderByDescending(m => m.SasiaStokut) : query.OrderBy(m => m.SasiaStokut);
                        break;
                    default:
                        query = query.OrderBy(m => m.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(m => m.Id);
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialDto>>(items);

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
            var material = await _unitOfWork.Materials.Query()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (material == null) return NotFound(new { Message = "Materiali nuk u gjet." });
            return Ok(_mapper.Map<MaterialDto>(material));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] MaterialCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(dto.FurnitoriId);
            if (supplier == null) return BadRequest(new { Message = "Furnitori nuk ekziston." });

            var material = _mapper.Map<Material>(dto);
            await _unitOfWork.Materials.AddAsync(material);
            await _unitOfWork.CompleteAsync();

            var createdMaterial = await _unitOfWork.Materials.Query()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == material.Id);

            return CreatedAtAction(nameof(GetById), new { id = material.Id }, _mapper.Map<MaterialDto>(createdMaterial));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var material = await _unitOfWork.Materials.GetByIdAsync(id);
            if (material == null) return NotFound(new { Message = "Materiali nuk u gjet." });

            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(dto.FurnitoriId);
            if (supplier == null) return BadRequest(new { Message = "Furnitori nuk ekziston." });

            _mapper.Map(dto, material);
            _unitOfWork.Materials.Update(material);
            await _unitOfWork.CompleteAsync();

            var updatedMaterial = await _unitOfWork.Materials.Query()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == material.Id);

            return Ok(_mapper.Map<MaterialDto>(updatedMaterial));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var material = await _unitOfWork.Materials.GetByIdAsync(id);
            if (material == null) return NotFound(new { Message = "Materiali nuk u gjet." });

            _unitOfWork.Materials.Delete(material);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Materiali u fshi me sukses." });
        }
    }
}
