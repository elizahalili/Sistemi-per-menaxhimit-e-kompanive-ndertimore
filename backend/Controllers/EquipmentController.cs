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
    public class EquipmentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public EquipmentController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<EquipmentDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.Equipment.GetQueryable();

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(e => e.Emertimi.ToLower().Contains(s) || 
                                                 e.Lloji.ToLower().Contains(s));
            }

            // Filtering by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(e => e.Statusi == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(e => e.Emertimi) : queryable.OrderBy(e => e.Emertimi);
                else if (query.SortBy.ToLower() == "kostojaditore")
                    queryable = isDesc ? queryable.OrderByDescending(e => e.KostojaDitore) : queryable.OrderBy(e => e.KostojaDitore);
            }
            else
            {
                queryable = queryable.OrderBy(e => e.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<EquipmentDto>>(items);

            return Ok(new PaginatedResponseDto<EquipmentDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EquipmentDto>> GetById(int id)
        {
            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { message = "Pajisja nuk u gjet." });
            return Ok(_mapper.Map<EquipmentDto>(equipment));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<EquipmentDto>> Create([FromBody] EquipmentCreateUpdateDto dto)
        {
            var equipment = _mapper.Map<Equipment>(dto);
            await _unitOfWork.Equipment.AddAsync(equipment);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, _mapper.Map<EquipmentDto>(equipment));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EquipmentCreateUpdateDto dto)
        {
            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { message = "Pajisja nuk u gjet." });

            _mapper.Map(dto, equipment);
            _unitOfWork.Equipment.Update(equipment);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<EquipmentDto>(equipment));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { message = "Pajisja nuk u gjet." });

            _unitOfWork.Equipment.Delete(equipment);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Pajisja u fshi me sukses." });
        }
    }
}
