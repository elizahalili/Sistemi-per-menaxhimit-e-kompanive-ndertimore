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
    public class WorkersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public WorkersController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? profesioni,
            [FromQuery] string? status,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Workers.Query();

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(w => w.Emri.ToLower().Contains(s) || 
                                         w.Mbiemri.ToLower().Contains(s) || 
                                         (w.Email != null && w.Email.ToLower().Contains(s)) ||
                                         w.Profesioni.ToLower().Contains(s));
            }

            // Profession filter
            if (!string.IsNullOrEmpty(profesioni))
            {
                query = query.Where(w => w.Profesioni == profesioni);
            }

            // Status filter
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(w => w.Statusi == status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "emri":
                        query = isDesc ? query.OrderByDescending(w => w.Emri) : query.OrderBy(w => w.Emri);
                        break;
                    case "mbiemri":
                        query = isDesc ? query.OrderByDescending(w => w.Mbiemri) : query.OrderBy(w => w.Mbiemri);
                        break;
                    case "pagaditore":
                        query = isDesc ? query.OrderByDescending(w => w.PagaDitore) : query.OrderBy(w => w.PagaDitore);
                        break;
                    case "datapunesimit":
                        query = isDesc ? query.OrderByDescending(w => w.DataPunesimit) : query.OrderBy(w => w.DataPunesimit);
                        break;
                    default:
                        query = query.OrderBy(w => w.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(w => w.Id);
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<WorkerDto>>(items);

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
            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { Message = "Punëtori nuk u gjet." });
            return Ok(_mapper.Map<WorkerDto>(worker));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] WorkerCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var worker = _mapper.Map<Worker>(dto);
            await _unitOfWork.Workers.AddAsync(worker);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = worker.Id }, _mapper.Map<WorkerDto>(worker));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] WorkerCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { Message = "Punëtori nuk u gjet." });

            _mapper.Map(dto, worker);
            _unitOfWork.Workers.Update(worker);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<WorkerDto>(worker));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { Message = "Punëtori nuk u gjet." });

            _unitOfWork.Workers.Delete(worker);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Punëtori u fshi me sukses." });
        }
    }
}
