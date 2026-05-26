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
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int? klientiId,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Projects.Query().Include(p => p.Client).AsQueryable();

            // Search Filter
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(p => p.Emertimi.ToLower().Contains(s) || 
                                         (p.Pershkrimi != null && p.Pershkrimi.ToLower().Contains(s)) ||
                                         (p.Lokacioni != null && p.Lokacioni.ToLower().Contains(s)));
            }

            // Status Filter
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Statusi == status);
            }

            // Client Filter
            if (klientiId.HasValue)
            {
                query = query.Where(p => p.KlientiId == klientiId.Value);
            }

            // Sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "emertimi":
                        query = isDesc ? query.OrderByDescending(p => p.Emertimi) : query.OrderBy(p => p.Emertimi);
                        break;
                    case "buxheti":
                        query = isDesc ? query.OrderByDescending(p => p.Buxheti) : query.OrderBy(p => p.Buxheti);
                        break;
                    case "datafillimit":
                        query = isDesc ? query.OrderByDescending(p => p.DataFillimit) : query.OrderBy(p => p.DataFillimit);
                        break;
                    case "progresi":
                    case "progresitotal":
                        query = isDesc ? query.OrderByDescending(p => p.ProgresiTotal) : query.OrderBy(p => p.ProgresiTotal);
                        break;
                    default:
                        query = query.OrderBy(p => p.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(p => p.Id);
            }

            // Pagination
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<ProjectDto>>(items);

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
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound(new { Message = "Projekti nuk u gjet." });
            return Ok(_mapper.Map<ProjectDto>(project));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] ProjectCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Validate client exists
            var client = await _unitOfWork.Clients.GetByIdAsync(dto.KlientiId);
            if (client == null) return BadRequest(new { Message = "Klienti i specifikuar nuk ekziston." });

            var project = _mapper.Map<Project>(dto);
            await _unitOfWork.Projects.AddAsync(project);
            await _unitOfWork.CompleteAsync();

            var createdProject = await _unitOfWork.Projects.Query()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, _mapper.Map<ProjectDto>(createdProject));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _unitOfWork.Projects.GetByIdAsync(id);
            if (project == null) return NotFound(new { Message = "Projekti nuk u gjet." });

            var client = await _unitOfWork.Clients.GetByIdAsync(dto.KlientiId);
            if (client == null) return BadRequest(new { Message = "Klienti i specifikuar nuk ekziston." });

            _mapper.Map(dto, project);
            _unitOfWork.Projects.Update(project);
            await _unitOfWork.CompleteAsync();

            var updatedProject = await _unitOfWork.Projects.Query()
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            return Ok(_mapper.Map<ProjectDto>(updatedProject));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _unitOfWork.Projects.GetByIdAsync(id);
            if (project == null) return NotFound(new { Message = "Projekti nuk u gjet." });

            _unitOfWork.Projects.Delete(project);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Projekti u fshi me sukses." });
        }
    }
}
