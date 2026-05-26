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
    public class TaskAssignmentsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TaskAssignmentsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? detyraId,
            [FromQuery] int? punetoriId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _unitOfWork.TaskAssignments.Query()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .AsQueryable();

            if (detyraId.HasValue)
            {
                query = query.Where(ta => ta.DetyraId == detyraId.Value);
            }

            if (punetoriId.HasValue)
            {
                query = query.Where(ta => ta.PunetoriId == punetoriId.Value);
            }

            query = query.OrderByDescending(ta => ta.Id);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<TaskAssignmentDto>>(items);

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
            var assignment = await _unitOfWork.TaskAssignments.Query()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == id);

            if (assignment == null) return NotFound(new { Message = "Caktimi i punës nuk u gjet." });
            return Ok(_mapper.Map<TaskAssignmentDto>(assignment));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] TaskAssignmentCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var task = await _unitOfWork.Tasks.GetByIdAsync(dto.DetyraId);
            if (task == null) return BadRequest(new { Message = "Detyra nuk ekziston." });

            var worker = await _unitOfWork.Workers.GetByIdAsync(dto.PunetoriId);
            if (worker == null) return BadRequest(new { Message = "Punëtori nuk ekziston." });

            var assignment = _mapper.Map<TaskAssignment>(dto);
            await _unitOfWork.TaskAssignments.AddAsync(assignment);
            await _unitOfWork.CompleteAsync();

            var created = await _unitOfWork.TaskAssignments.Query()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == assignment.Id);

            return CreatedAtAction(nameof(GetById), new { id = assignment.Id }, _mapper.Map<TaskAssignmentDto>(created));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskAssignmentCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var assignment = await _unitOfWork.TaskAssignments.GetByIdAsync(id);
            if (assignment == null) return NotFound(new { Message = "Caktimi i punës nuk u gjet." });

            var task = await _unitOfWork.Tasks.GetByIdAsync(dto.DetyraId);
            if (task == null) return BadRequest(new { Message = "Detyra nuk ekziston." });

            var worker = await _unitOfWork.Workers.GetByIdAsync(dto.PunetoriId);
            if (worker == null) return BadRequest(new { Message = "Punëtori nuk ekziston." });

            _mapper.Map(dto, assignment);
            _unitOfWork.TaskAssignments.Update(assignment);
            await _unitOfWork.CompleteAsync();

            var updated = await _unitOfWork.TaskAssignments.Query()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == assignment.Id);

            return Ok(_mapper.Map<TaskAssignmentDto>(updated));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var assignment = await _unitOfWork.TaskAssignments.GetByIdAsync(id);
            if (assignment == null) return NotFound(new { Message = "Caktimi nuk u gjet." });

            _unitOfWork.TaskAssignments.Delete(assignment);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Caktimi u fshi me sukses." });
        }
    }
}
