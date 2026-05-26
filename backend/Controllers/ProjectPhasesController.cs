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
        public async Task<IActionResult> GetAll(
            [FromQuery] int? projektiId,
            [FromQuery] string? status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _unitOfWork.ProjectPhases.Query().Include(pp => pp.Project).AsQueryable();

            if (projektiId.HasValue)
            {
                query = query.Where(pp => pp.ProjektiId == projektiId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(pp => pp.Statusi == status);
            }

            query = query.OrderBy(pp => pp.ProjektiId).ThenBy(pp => pp.Rendi);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<ProjectPhaseDto>>(items);

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
            var phase = await _unitOfWork.ProjectPhases.Query()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == id);

            if (phase == null) return NotFound(new { Message = "Faza e projektit nuk u gjet." });
            return Ok(_mapper.Map<ProjectPhaseDto>(phase));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] ProjectPhaseCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjektiId);
            if (project == null) return BadRequest(new { Message = "Projekti nuk ekziston." });

            var phase = _mapper.Map<ProjectPhase>(dto);
            await _unitOfWork.ProjectPhases.AddAsync(phase);
            await _unitOfWork.CompleteAsync();

            var created = await _unitOfWork.ProjectPhases.Query()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == phase.Id);

            return CreatedAtAction(nameof(GetById), new { id = phase.Id }, _mapper.Map<ProjectPhaseDto>(created));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectPhaseCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(id);
            if (phase == null) return NotFound(new { Message = "Faza nuk u gjet." });

            var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjektiId);
            if (project == null) return BadRequest(new { Message = "Projekti nuk ekziston." });

            _mapper.Map(dto, phase);
            _unitOfWork.ProjectPhases.Update(phase);
            await _unitOfWork.CompleteAsync();

            var updated = await _unitOfWork.ProjectPhases.Query()
                .Include(pp => pp.Project)
                .FirstOrDefaultAsync(pp => pp.Id == phase.Id);

            return Ok(_mapper.Map<ProjectPhaseDto>(updated));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var phase = await _unitOfWork.ProjectPhases.GetByIdAsync(id);
            if (phase == null) return NotFound(new { Message = "Faza nuk u gjet." });

            _unitOfWork.ProjectPhases.Delete(phase);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Faza u fshi me sukses." });
        }
    }
}
