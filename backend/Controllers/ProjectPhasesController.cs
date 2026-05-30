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
    public class ProjectPhasesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProjectPhasesController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<ProjectPhaseDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.ProjectPhases.GetQueryable().Include(pp => pp.Project);

            // Filter by ProjektiId
            if (query.ProjektiId.HasValue)
            {
                queryable = queryable.Where(pp => pp.ProjektiId == query.ProjektiId.Value);
            }

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(pp => pp.Emertimi.ToLower().Contains(s) || 
                                                 pp.Pershkrimi.ToLower().Contains(s));
            }

            // Filter by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(pp => pp.Statusi == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(pp => pp.Emertimi) : queryable.OrderBy(pp => pp.Emertimi);
                else if (query.SortBy.ToLower() == "rendi")
                    queryable = isDesc ? queryable.OrderByDescending(pp => pp.Rendi) : queryable.OrderBy(pp => pp.Rendi);
            }
            else
            {
                queryable = queryable.OrderBy(pp => pp.ProjektiId).ThenBy(pp => pp.Rendi);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<ProjectPhaseDto>>(items);

            return Ok(new PaginatedResponseDto<ProjectPhaseDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectPhaseDto>> GetById(int id)
        {
            var phase = await _unitOfWork.ProjectPhases.GetQueryable()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == id);

            if (phase == null) return NotFound(new { message = "Faza nuk u gjet." });
            return Ok(_mapper.Map<ProjectPhaseDto>(phase));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<ProjectPhaseDto>> Create([FromBody] ProjectPhaseCreateUpdateDto dto)
        {
            var phase = _mapper.Map<ProjectPhase>(dto);
            await _unitOfWork.ProjectPhases.AddAsync(phase);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.ProjectPhases.GetQueryable()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == phase.Id);

            return CreatedAtAction(nameof(GetById), new { id = phase.Id }, _mapper.Map<ProjectPhaseDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectPhaseCreateUpdateDto dto)
        {
            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(id);
            if (phase == null) return NotFound(new { message = "Faza nuk u gjet." });

            _mapper.Map(dto, phase);
            _unitOfWork.ProjectPhases.Update(phase);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.ProjectPhases.GetQueryable()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == phase.Id);

            return Ok(_mapper.Map<ProjectPhaseDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(id);
            if (phase == null) return NotFound(new { message = "Faza nuk u gjet." });

            _unitOfWork.ProjectPhases.Delete(phase);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Faza u fshi me sukses." });
        }
    }
}
