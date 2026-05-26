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
    public class ClientsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ClientsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? lloji,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Clients.Query();

            // Search Filter
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(c => c.Emri.ToLower().Contains(s) || 
                                         c.MbiemriKompania.ToLower().Contains(s) || 
                                         (c.Email != null && c.Email.ToLower().Contains(s)));
            }

            // Category Filter
            if (!string.IsNullOrEmpty(lloji))
            {
                query = query.Where(c => c.LlojiKlientit == lloji);
            }

            // Sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "emri":
                        query = isDesc ? query.OrderByDescending(c => c.Emri) : query.OrderBy(c => c.Emri);
                        break;
                    case "mbiemri":
                    case "mbiemrikompania":
                        query = isDesc ? query.OrderByDescending(c => c.MbiemriKompania) : query.OrderBy(c => c.MbiemriKompania);
                        break;
                    default:
                        query = query.OrderBy(c => c.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(c => c.Id);
            }

            // Pagination
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<ClientDto>>(items);

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
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { Message = "Klienti nuk u gjet." });
            return Ok(_mapper.Map<ClientDto>(client));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] ClientCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var client = _mapper.Map<Client>(dto);
            await _unitOfWork.Clients.AddAsync(client);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = client.Id }, _mapper.Map<ClientDto>(client));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] ClientCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { Message = "Klienti nuk u gjet." });

            _mapper.Map(dto, client);
            _unitOfWork.Clients.Update(client);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<ClientDto>(client));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { Message = "Klienti nuk u gjet." });

            _unitOfWork.Clients.Delete(client);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Klienti u fshi me sukses." });
        }
    }
}
