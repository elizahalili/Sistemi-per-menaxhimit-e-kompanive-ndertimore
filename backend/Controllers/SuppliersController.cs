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
    public class SuppliersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SuppliersController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _unitOfWork.Suppliers.Query();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(sup => sup.Emertimi.ToLower().Contains(s) || 
                                           (sup.Kontakti != null && sup.Kontakti.ToLower().Contains(s)) ||
                                           (sup.Specialiteti != null && sup.Specialiteti.ToLower().Contains(s)));
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortOrder.ToLower() == "desc";
                switch (sortBy.ToLower())
                {
                    case "emertimi":
                        query = isDesc ? query.OrderByDescending(s => s.Emertimi) : query.OrderBy(s => s.Emertimi);
                        break;
                    case "specialiteti":
                        query = isDesc ? query.OrderByDescending(s => s.Specialiteti) : query.OrderBy(s => s.Specialiteti);
                        break;
                    default:
                        query = query.OrderBy(s => s.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(s => s.Id);
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<SupplierDto>>(items);

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
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { Message = "Furnitori nuk u gjet." });
            return Ok(_mapper.Map<SupplierDto>(supplier));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] SupplierCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var supplier = _mapper.Map<Supplier>(dto);
            await _unitOfWork.Suppliers.AddAsync(supplier);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, _mapper.Map<SupplierDto>(supplier));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { Message = "Furnitori nuk u gjet." });

            _mapper.Map(dto, supplier);
            _unitOfWork.Suppliers.Update(supplier);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<SupplierDto>(supplier));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { Message = "Furnitori nuk u gjet." });

            _unitOfWork.Suppliers.Delete(supplier);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Furnitori u fshi me sukses." });
        }
    }
}
