using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<ActionResult<PaginatedResponseDto<MaterialDto>>> GetAll([FromQuery] QueryParameters query)
        {
            IQueryable<Material> queryable = _unitOfWork.Materials.GetQueryable().Include(m => m.Supplier);

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(m => m.Emertimi.ToLower().Contains(s) || 
                                                 (m.Kategoria != null && m.Kategoria.ToLower().Contains(s)));
            }

            // Filtering by Category/Status
            if (!string.IsNullOrEmpty(query.Status)) // using status parameter as general Category filter if needed
            {
                queryable = queryable.Where(m => m.Kategoria == query.Status);
            }

            if (query.LowStock == true)
            {
                queryable = queryable.Where(m => m.SasiaStokut <= 20);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(m => m.Emertimi) : queryable.OrderBy(m => m.Emertimi);
                else if (query.SortBy.ToLower() == "sasiastokut")
                    queryable = isDesc ? queryable.OrderByDescending(m => m.SasiaStokut) : queryable.OrderBy(m => m.SasiaStokut);
                else if (query.SortBy.ToLower() == "cmiminjesi")
                    queryable = isDesc ? queryable.OrderByDescending(m => m.CmimiNjesi) : queryable.OrderBy(m => m.CmimiNjesi);
            }
            else
            {
                queryable = queryable.OrderBy(m => m.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<MaterialDto>>(items);

            return Ok(new PaginatedResponseDto<MaterialDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialDto>> GetById(int id)
        {
            var material = await _unitOfWork.Materials.GetQueryable()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (material == null) return NotFound(new { message = "Materiali nuk u gjet." });
            return Ok(_mapper.Map<MaterialDto>(material));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<MaterialDto>> Create([FromBody] MaterialCreateUpdateDto dto)
        {
            var material = _mapper.Map<Material>(dto);
            await _unitOfWork.Materials.AddAsync(material);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Materials.GetQueryable()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == material.Id);

            return CreatedAtAction(nameof(GetById), new { id = material.Id }, _mapper.Map<MaterialDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialCreateUpdateDto dto)
        {
            var material = await _unitOfWork.Materials.GetByIdAsync(id);
            if (material == null) return NotFound(new { message = "Materiali nuk u gjet." });

            _mapper.Map(dto, material);
            _unitOfWork.Materials.Update(material);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Materials.GetQueryable()
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == material.Id);

            return Ok(_mapper.Map<MaterialDto>(result));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var material = await _unitOfWork.Materials.GetByIdAsync(id);
            if (material == null) return NotFound(new { message = "Materiali nuk u gjet." });

            _unitOfWork.Materials.Delete(material);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Materiali u fshi me sukses." });
        }
    }
}
