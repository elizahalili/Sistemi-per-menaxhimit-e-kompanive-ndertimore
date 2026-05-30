using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialUsagesController : ControllerBase
    {
        private readonly IMaterialUsageService _usageService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaterialUsagesController(IMaterialUsageService usageService, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _usageService = usageService;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<MaterialUsageDto>>> GetAll([FromQuery] QueryParameters query)
        {
            var queryable = _unitOfWork.MaterialUsages.GetQueryable()
                .Include(mu => mu.Project)
                .Include(mu => mu.Material)
                .Include(mu => mu.ProjectPhase);

            // Filter by ProjektiId
            if (query.ProjektiId.HasValue)
            {
                queryable = queryable.Where(mu => mu.ProjektiId == query.ProjektiId.Value);
            }

            // Search
            if (!string.IsNullOrEmpty(query.Search))
            {
                var s = query.Search.ToLower();
                queryable = queryable.Where(mu => mu.Material != null && mu.Material.Emertimi.ToLower().Contains(s) || 
                                                 mu.Project != null && mu.Project.Emertimi.ToLower().Contains(s));
            }

            var totalCount = await queryable.CountAsync();
            var items = await queryable
                .OrderByDescending(mu => mu.Id)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<MaterialUsageDto>>(items);

            return Ok(new PaginatedResponseDto<MaterialUsageDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialUsageDto>> GetById(int id)
        {
            var usage = await _unitOfWork.MaterialUsages.GetQueryable()
                .Include(mu => mu.Project)
                .Include(mu => mu.Material)
                .Include(mu => mu.ProjectPhase)
                .FirstOrDefaultAsync(mu => mu.Id == id);

            if (usage == null) return NotFound(new { message = "Përdorimi i materialit nuk u gjet." });
            return Ok(_mapper.Map<MaterialUsageDto>(usage));
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<MaterialUsageDto>> Create([FromBody] MaterialUsageCreateUpdateDto dto)
        {
            var usage = _mapper.Map<MaterialUsage>(dto);
            try
            {
                await _usageService.CreateUsageAsync(usage);
                
                var result = await _unitOfWork.MaterialUsages.GetQueryable()
                    .Include(mu => mu.Project)
                    .Include(mu => mu.Material)
                    .Include(mu => mu.ProjectPhase)
                    .FirstOrDefaultAsync(mu => mu.Id == usage.Id);

                return CreatedAtAction(nameof(GetById), new { id = usage.Id }, _mapper.Map<MaterialUsageDto>(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialUsageCreateUpdateDto dto)
        {
            var usage = _mapper.Map<MaterialUsage>(dto);
            try
            {
                var updated = await _usageService.UpdateUsageAsync(id, usage);
                
                var result = await _unitOfWork.MaterialUsages.GetQueryable()
                    .Include(mu => mu.Project)
                    .Include(mu => mu.Material)
                    .Include(mu => mu.ProjectPhase)
                    .FirstOrDefaultAsync(mu => mu.Id == updated.Id);

                return Ok(_mapper.Map<MaterialUsageDto>(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _usageService.DeleteUsageAsync(id);
            if (!result) return NotFound(new { message = "Përdorimi i materialit nuk u gjet." });

            return Ok(new { message = "Përdorimi i materialit u fshi dhe stoku u rivendos." });
        }
    }
}
