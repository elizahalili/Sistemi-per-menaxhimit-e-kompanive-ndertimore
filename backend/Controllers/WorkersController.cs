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
        public async Task<ActionResult<PaginatedResponseDto<WorkerDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.Workers.GetQueryable();

            // Search by Name/Profession
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(w => w.Emri.ToLower().Contains(s) || 
                                                 w.Mbiemri.ToLower().Contains(s) || 
                                                 w.Profesioni.ToLower().Contains(s));
            }

            // Filtering by Status (e.g. Aktiv, Pushim)
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(w => w.Statusi == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emri")
                    queryable = isDesc ? queryable.OrderByDescending(w => w.Emri) : queryable.OrderBy(w => w.Emri);
                else if (query.SortBy.ToLower() == "pagaditore")
                    queryable = isDesc ? queryable.OrderByDescending(w => w.PagaDitore) : queryable.OrderBy(w => w.PagaDitore);
                else if (query.SortBy.ToLower() == "datapunesimit")
                    queryable = isDesc ? queryable.OrderByDescending(w => w.DataPunesimit) : queryable.OrderBy(w => w.DataPunesimit);
            }
            else
            {
                queryable = queryable.OrderBy(w => w.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<WorkerDto>>(items);

            return Ok(new PaginatedResponseDto<WorkerDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkerDto>> GetById(int id)
        {
            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { message = "Punëtori nuk u gjet." });
            return Ok(_mapper.Map<WorkerDto>(worker));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<WorkerDto>> Create([FromBody] WorkerCreateUpdateDto dto)
        {
            var worker = _mapper.Map<Worker>(dto);
            await _unitOfWork.Workers.AddAsync(worker);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = worker.Id }, _mapper.Map<WorkerDto>(worker));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] WorkerCreateUpdateDto dto)
        {
            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { message = "Punëtori nuk u gjet." });

            _mapper.Map(dto, worker);
            _unitOfWork.Workers.Update(worker);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<WorkerDto>(worker));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var worker = await _unitOfWork.Workers.GetByIdAsync(id);
            if (worker == null) return NotFound(new { message = "Punëtori nuk u gjet." });

            _unitOfWork.Workers.Delete(worker);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Punëtori u fshi me sukses." });
        }
    }
}
