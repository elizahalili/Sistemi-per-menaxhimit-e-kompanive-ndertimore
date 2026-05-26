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
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? lloji,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Equipment.Query();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(e => e.Emertimi.ToLower().Contains(s) || e.Lloji.ToLower().Contains(s));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(e => e.Statusi == status);
            }

            if (!string.IsNullOrEmpty(lloji))
            {
                query = query.Where(e => e.Lloji == lloji);
            }

            query = query.OrderByDescending(e => e.Id);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<EquipmentDto>>(items);

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
            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { Message = "Pajisja nuk u gjet." });
            return Ok(_mapper.Map<EquipmentDto>(equipment));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] EquipmentCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var equipment = _mapper.Map<Equipment>(dto);
            await _unitOfWork.Equipment.AddAsync(equipment);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, _mapper.Map<EquipmentDto>(equipment));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] EquipmentCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { Message = "Pajisja nuk u gjet." });

            _mapper.Map(dto, equipment);
            _unitOfWork.Equipment.Update(equipment);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<EquipmentDto>(equipment));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var equipment = await _unitOfWork.Equipment.GetByIdAsync(id);
            if (equipment == null) return NotFound(new { Message = "Pajisja nuk u gjet." });

            _unitOfWork.Equipment.Delete(equipment);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Pajisja u fshi me sukses." });
        }
    }
}
