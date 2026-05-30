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
        public async Task<ActionResult<PaginatedResponseDto<TaskAssignmentDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.TaskAssignments.GetQueryable()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker);

            // Filter by WorkerId
            if (query.KlientiId.HasValue) // reusing KlientiId as WorkerId filter if needed or general filter
            {
                queryable = queryable.Where(ta => ta.PunetoriId == query.KlientiId.Value);
            }

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(ta => ta.Task != null && ta.Task.Emertimi.ToLower().Contains(s) || 
                                                 ta.Worker != null && ta.Worker.Emri.ToLower().Contains(s) || 
                                                 ta.Worker != null && ta.Worker.Mbiemri.ToLower().Contains(s));
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .OrderByDescending(ta => ta.Id)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<TaskAssignmentDto>>(items);

            return Ok(new PaginatedResponseDto<TaskAssignmentDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskAssignmentDto>> GetById(int id)
        {
            var assignment = await _unitOfWork.TaskAssignments.GetQueryable()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == id);

            if (assignment == null) return NotFound(new { message = "Caktimi i detyrës nuk u gjet." });
            return Ok(_mapper.Map<TaskAssignmentDto>(assignment));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<TaskAssignmentDto>> Create([FromBody] TaskAssignmentCreateUpdateDto dto)
        {
            var assignment = _mapper.Map<TaskAssignment>(dto);
            await _unitOfWork.TaskAssignments.AddAsync(assignment);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.TaskAssignments.GetQueryable()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == assignment.Id);

            return CreatedAtAction(nameof(GetById), new { id = assignment.Id }, _mapper.Map<TaskAssignmentDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskAssignmentCreateUpdateDto dto)
        {
            var assignment = await _unitOfWork.TaskAssignments.GetByIdAsync(id);
            if (assignment == null) return NotFound(new { message = "Caktimi i detyrës nuk u gjet." });

            _mapper.Map(dto, assignment);
            _unitOfWork.TaskAssignments.Update(assignment);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.TaskAssignments.GetQueryable()
                .Include(ta => ta.Task)
                .Include(ta => ta.Worker)
                .FirstOrDefaultAsync(ta => ta.Id == assignment.Id);

            return Ok(_mapper.Map<TaskAssignmentDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var assignment = await _unitOfWork.TaskAssignments.GetByIdAsync(id);
            if (assignment == null) return NotFound(new { message = "Caktimi i detyrës nuk u gjet." });

            _unitOfWork.TaskAssignments.Delete(assignment);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Caktimi i detyrës u fshi me sukses." });
        }
    }
}
