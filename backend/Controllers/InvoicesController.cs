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
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int? projektiId,
            [FromQuery] int? klientiId,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Invoices.Query()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .AsQueryable();

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(i => (i.Pershkrimi != null && i.Pershkrimi.ToLower().Contains(s)) ||
                                         i.Project!.Emertimi.ToLower().Contains(s) ||
                                         i.Client!.Emri.ToLower().Contains(s) ||
                                         i.Client!.MbiemriKompania.ToLower().Contains(s));
            }

            // Status Filter
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Statusi == status);
            }

            // Project Filter
            if (projektiId.HasValue)
            {
                query = query.Where(i => i.ProjektiId == projektiId.Value);
            }

            // Client Filter
            if (klientiId.HasValue)
            {
                query = query.Where(i => i.KlientiId == klientiId.Value);
            }

            // Sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "shuma":
                        query = isDesc ? query.OrderByDescending(i => i.Shuma) : query.OrderBy(i => i.Shuma);
                        break;
                    case "datafatures":
                        query = isDesc ? query.OrderByDescending(i => i.DataFatures) : query.OrderBy(i => i.DataFatures);
                        break;
                    case "datapageses":
                        query = isDesc ? query.OrderByDescending(i => i.DataPageses) : query.OrderBy(i => i.DataPageses);
                        break;
                    default:
                        query = query.OrderBy(i => i.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(i => i.Id);
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<InvoiceDto>>(items);

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
            var invoice = await _unitOfWork.Invoices.Query()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound(new { Message = "Fatura nuk u gjet." });
            return Ok(_mapper.Map<InvoiceDto>(invoice));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] InvoiceCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjektiId);
            if (project == null) return BadRequest(new { Message = "Projekti nuk ekziston." });

            var client = await _unitOfWork.Clients.GetByIdAsync(dto.KlientiId);
            if (client == null) return BadRequest(new { Message = "Klienti nuk ekziston." });

            var invoice = _mapper.Map<Invoice>(dto);
            await _unitOfWork.Invoices.AddAsync(invoice);
            await _unitOfWork.CompleteAsync();

            var createdInvoice = await _unitOfWork.Invoices.Query()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, _mapper.Map<InvoiceDto>(createdInvoice));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null) return NotFound(new { Message = "Fatura nuk u gjet." });

            var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjektiId);
            if (project == null) return BadRequest(new { Message = "Projekti nuk ekziston." });

            var client = await _unitOfWork.Clients.GetByIdAsync(dto.KlientiId);
            if (client == null) return BadRequest(new { Message = "Klienti nuk ekziston." });

            _mapper.Map(dto, invoice);
            _unitOfWork.Invoices.Update(invoice);
            await _unitOfWork.CompleteAsync();

            var updatedInvoice = await _unitOfWork.Invoices.Query()
                .Include(i => i.Project)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            return Ok(_mapper.Map<InvoiceDto>(updatedInvoice));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null) return NotFound(new { Message = "Fatura nuk u gjet." });

            _unitOfWork.Invoices.Delete(invoice);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Fatura u fshi me sukses." });
        }
    }
}
