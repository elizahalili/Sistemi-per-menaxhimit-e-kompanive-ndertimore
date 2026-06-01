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
    public class InvoicesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public InvoicesController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<InvoiceDto>>> GetAll([FromQuery] QueryParameters query)
        {
            IQueryable<Invoice> queryable = _unitOfWork.Invoices.GetQueryable()
                .Include(i => i.Project)
                .Include(i => i.Client);

            // Search by description or parent references
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(i => i.Pershkrimi.ToLower().Contains(s) || 
                                                 i.Project != null && i.Project.Emertimi.ToLower().Contains(s) || 
                                                 i.Client != null && i.Client.Emri.ToLower().Contains(s) || 
                                                 i.Client != null && i.Client.MbiemriKompania.ToLower().Contains(s));
            }

            // Filtering by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                queryable = queryable.Where(i => i.Statusi == query.Status);
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "shuma")
                    queryable = isDesc ? queryable.OrderByDescending(i => i.Shuma) : queryable.OrderBy(i => i.Shuma);
                else if (query.SortBy.ToLower() == "datafatures")
                    queryable = isDesc ? queryable.OrderByDescending(i => i.DataFatures) : queryable.OrderBy(i => i.DataFatures);
            }
            else
            {
                queryable = queryable.OrderByDescending(i => i.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<InvoiceDto>>(items);

            return Ok(new PaginatedResponseDto<InvoiceDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDto>> GetById(int id)
        {
            var invoice = await _unitOfWork.Invoices.GetQueryable()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound(new { message = "Fatura nuk u gjet." });
            return Ok(_mapper.Map<InvoiceDto>(invoice));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<InvoiceDto>> Create([FromBody] InvoiceCreateUpdateDto dto)
        {
            var invoice = _mapper.Map<Invoice>(dto);
            await _unitOfWork.Invoices.AddAsync(invoice);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Invoices.GetQueryable()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, _mapper.Map<InvoiceDto>(result));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceCreateUpdateDto dto)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null) return NotFound(new { message = "Fatura nuk u gjet." });

            _mapper.Map(dto, invoice);
            _unitOfWork.Invoices.Update(invoice);
            await _unitOfWork.CompleteAsync();

            var result = await _unitOfWork.Invoices.GetQueryable()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            return Ok(_mapper.Map<InvoiceDto>(result));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null) return NotFound(new { message = "Fatura nuk u gjet." });

            _unitOfWork.Invoices.Delete(invoice);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Fatura u fshi me sukses." });
        }
    }
}
