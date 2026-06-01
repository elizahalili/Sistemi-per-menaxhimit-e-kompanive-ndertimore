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
using TaskEntity = backend.Entities.Task;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<ActionResult<PaginatedResponseDto<TaskDto>>> GetAll([FromQuery] QueryParameters query)
        {
            IQueryable<TaskEntity> queryable = _unitOfWork.Tasks.GetQueryable().Include(t => t.ProjectPhase);

            // Filter by FazaId
            if (query.FazaId.HasValue)
            {
                queryable = queryable.Where(t => t.FazaId == query.FazaId.Value);
            }

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(t => t.Emertimi.ToLower().Contains(s) || 
                                                 t.Pershkrimi.ToLower().Contains(s));
            }

            // Filter by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(t => t.Statusi == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(t => t.Emertimi) : queryable.OrderBy(t => t.Emertimi);
                else if (query.SortBy.ToLower() == "prioriteti")
                    queryable = isDesc ? queryable.OrderByDescending(t => t.Prioriteti) : queryable.OrderBy(t => t.Prioriteti);
            }
            else
            {
                queryable = queryable.OrderBy(t => t.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<TaskDto>>(items);

            return Ok(new PaginatedResponseDto<TaskDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetById(int id)
        {
            var task = await _unitOfWork.Tasks.GetQueryable()
                .Include(t => t.ProjectPhase)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound(new { message = "Detyra nuk u gjet." });
            return Ok(_mapper.Map<TaskDto>(task));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<TaskDto>> Create([FromBody] TaskCreateUpdateDto dto)
        {
            var task = _mapper.Map<TaskEntity>(dto);
            await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Tasks.GetQueryable()
                .Include(t => t.ProjectPhase)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, _mapper.Map<TaskDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskCreateUpdateDto dto)
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null) return NotFound(new { message = "Detyra nuk u gjet." });

            _mapper.Map(dto, task);
            _unitOfWork.Tasks.Update(task);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Tasks.GetQueryable()
                .Include(t => t.ProjectPhase)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            return Ok(_mapper.Map<TaskDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null) return NotFound(new { message = "Detyra nuk u gjet." });

            _unitOfWork.Tasks.Delete(task);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Detyra u fshi me sukses." });
        }
    }
}
