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
    public class ProjectsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProjectsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<ProjectDto>>> GetAll([FromQuery] QueryParameters query)
        {
            IQueryable<Project> queryable = _unitOfWork.Projects.GetQueryable().Include(p => p.Client);

            // Search by Title/Location
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(p => p.Emertimi.ToLower().Contains(s) || 
                                                 p.Lokacioni.ToLower().Contains(s));
            }

            // Filtering by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(p => p.Statusi == query.Status);
            }

            // Filtering by ClientId
            if (query.KlientiId.HasValue)
            {
                queryable = queryable.Where(p => p.KlientiId == query.KlientiId.Value);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(p => p.Emertimi) : queryable.OrderBy(p => p.Emertimi);
                else if (query.SortBy.ToLower() == "buxheti")
                    queryable = isDesc ? queryable.OrderByDescending(p => p.Buxheti) : queryable.OrderBy(p => p.Buxheti);
                else if (query.SortBy.ToLower() == "progresitotal")
                    queryable = isDesc ? queryable.OrderByDescending(p => p.ProgresiTotal) : queryable.OrderBy(p => p.ProgresiTotal);
            }
            else
            {
                queryable = queryable.OrderByDescending(p => p.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<ProjectDto>>(items);

            return Ok(new PaginatedResponseDto<ProjectDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetById(int id)
        {
            var project = await _unitOfWork.Projects.GetQueryable()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound(new { message = "Projekti nuk u gjet." });
            return Ok(_mapper.Map<ProjectDto>(project));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> Create([FromBody] ProjectCreateUpdateDto dto)
        {
            var project = _mapper.Map<Project>(dto);
            await _unitOfWork.Projects.AddAsync(project);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Projects.GetQueryable()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, _mapper.Map<ProjectDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectCreateUpdateDto dto)
        {
            var project = await _unitOfWork.Projects.GetByIdAsync(id);
            if (project == null) return NotFound(new { message = "Projekti nuk u gjet." });

            _mapper.Map(dto, project);
            _unitOfWork.Projects.Update(project);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Projects.GetQueryable()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            return Ok(_mapper.Map<ProjectDto>(result));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _unitOfWork.Projects.GetByIdAsync(id);
            if (project == null) return NotFound(new { message = "Projekti nuk u gjet." });

            _unitOfWork.Projects.Delete(project);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Projekti u fshi me sukses." });
        }
    }
}
