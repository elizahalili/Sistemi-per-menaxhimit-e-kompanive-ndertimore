using AutoMapper;
using ConstructionCompanyAPI.Data.Repositories;
using ConstructionCompanyAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionCompanyAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TasksController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? fazaId,
            [FromQuery] string? status,
            [FromQuery] string? prioriteti,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _unitOfWork.Tasks.Query().Include(t => t.Phase).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(t => t.Emertimi.ToLower().Contains(s) || 
                                         (t.Pershkrimi != null && t.Pershkrimi.ToLower().Contains(s)));
            }

            if (fazaId.HasValue)
            {
                query = query.Where(t => t.FazaId == fazaId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(t => t.Statusi == status);
            }

            if (!string.IsNullOrEmpty(prioriteti))
            {
                query = query.Where(t => t.Prioriteti == prioriteti);
            }

            query = query.OrderByDescending(t => t.Id);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<TaskDto>>(items);

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
            var task = await _unitOfWork.Tasks.Query()
                .Include(t => t.Phase)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound(new { Message = "Detyra nuk u gjet." });
            return Ok(_mapper.Map<TaskDto>(task));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] TaskCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(dto.FazaId);
            if (phase == null) return BadRequest(new { Message = "Faza e projektit nuk ekziston." });

            var task = _mapper.Map<Models.Task>(dto);
            await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.CompleteAsync();

            var created = await _unitOfWork.Tasks.Query()
                .Include(t => t.Phase)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, _mapper.Map<TaskDto>(created));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null) return NotFound(new { Message = "Detyra nuk u gjet." });

            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(dto.FazaId);
            if (phase == null) return BadRequest(new { Message = "Faza e projektit nuk ekziston." });

            _mapper.Map(dto, task);
            _unitOfWork.Tasks.Update(task);
            await _unitOfWork.CompleteAsync();

            var updated = await _unitOfWork.Tasks.Query()
                .Include(t => t.Phase)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            return Ok(_mapper.Map<TaskDto>(updated));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null) return NotFound(new { Message = "Detyra nuk u gjet." });

            _unitOfWork.Tasks.Delete(task);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Detyra u fshi me sukses." });
        }
    }
}
