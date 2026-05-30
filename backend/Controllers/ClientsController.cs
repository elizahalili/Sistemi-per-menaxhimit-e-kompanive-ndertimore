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
        public async Task<ActionResult<PaginatedResponseDto<ClientDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.Clients.GetQueryable();

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(c => c.Emri.ToLower().Contains(s) || 
                                                 c.MbiemriKompania.ToLower().Contains(s) || 
                                                 c.Email.ToLower().Contains(s) || 
                                                 c.Adresa.ToLower().Contains(s));
            }

            // Filtering by Type (custom field llojiKlientit)
            if (!string.IsNullOrEmpty(query.Status)) // using query.Status as general filter
            {
                queryable = queryable.Where(c => c.LlojiKlientit == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emri")
                    queryable = isDesc ? queryable.OrderByDescending(c => c.Emri) : queryable.OrderBy(c => c.Emri);
                else if (query.SortBy.ToLower() == "mbiemrikompania")
                    queryable = isDesc ? queryable.OrderByDescending(c => c.MbiemriKompania) : queryable.OrderBy(c => c.MbiemriKompania);
            }
            else
            {
                queryable = queryable.OrderBy(c => c.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<ClientDto>>(items);

            return Ok(new PaginatedResponseDto<ClientDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetById(int id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { message = "Klienti nuk u gjet." });
            return Ok(_mapper.Map<ClientDto>(client));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<ClientDto>> Create([FromBody] ClientCreateUpdateDto dto)
        {
            var client = _mapper.Map<Client>(dto);
            await _unitOfWork.Clients.AddAsync(client);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = client.Id }, _mapper.Map<ClientDto>(client));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClientCreateUpdateDto dto)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { message = "Klienti nuk u gjet." });

            _mapper.Map(dto, client);
            _unitOfWork.Clients.Update(client);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<ClientDto>(client));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null) return NotFound(new { message = "Klienti nuk u gjet." });

            _unitOfWork.Clients.Delete(client);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Klienti u fshi me sukses." });
        }
    }
}
