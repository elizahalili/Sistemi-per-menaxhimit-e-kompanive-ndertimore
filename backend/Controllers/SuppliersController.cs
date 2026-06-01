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
        public async Task<ActionResult<PaginatedResponseDto<SupplierDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.Suppliers.GetQueryable();

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(supplier => supplier.Emertimi.ToLower().Contains(s) || 
                                                        (supplier.Kontakti != null && supplier.Kontakti.ToLower().Contains(s)) || 
                                                        (supplier.Specialiteti != null && supplier.Specialiteti.ToLower().Contains(s)));
            }

            // Sorting
            if (!string.IsNullOrEmpty(query.SortBy))
            {
                var isDesc = query.SortOrder.ToLower() == "desc";
                if (query.SortBy.ToLower() == "emertimi")
                    queryable = isDesc ? queryable.OrderByDescending(s => s.Emertimi) : queryable.OrderBy(s => s.Emertimi);
            }
            else
            {
                queryable = queryable.OrderBy(s => s.Id);
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<SupplierDto>>(items);

            return Ok(new PaginatedResponseDto<SupplierDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDto>> GetById(int id)
        {
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { message = "Furnitori nuk u gjet." });
            return Ok(_mapper.Map<SupplierDto>(supplier));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<SupplierDto>> Create([FromBody] SupplierCreateUpdateDto dto)
        {
            var supplier = _mapper.Map<Supplier>(dto);
            await _unitOfWork.Suppliers.AddAsync(supplier);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, _mapper.Map<SupplierDto>(supplier));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierCreateUpdateDto dto)
        {
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { message = "Furnitori nuk u gjet." });

            _mapper.Map(dto, supplier);
            _unitOfWork.Suppliers.Update(supplier);
            await _unitOfWork.CompleteAsync();

            return Ok(_mapper.Map<SupplierDto>(supplier));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
            if (supplier == null) return NotFound(new { message = "Furnitori nuk u gjet." });

            _unitOfWork.Suppliers.Delete(supplier);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Furnitori u fshi me sukses." });
        }
    }
}
