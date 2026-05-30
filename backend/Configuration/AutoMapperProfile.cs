using AutoMapper;
using backend.Entities;
using backend.DTOs;

namespace backend.Configuration
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // 1. Client Mappings
            CreateMap<Client, ClientDto>();
            CreateMap<ClientCreateUpdateDto, Client>();

            // 2. Project Mappings
            CreateMap<Project, ProjectDto>()
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => 
                    src.Client != null ? $"{src.Client.Emri} {src.Client.MbiemriKompania}".Trim() : string.Empty));
            CreateMap<ProjectCreateUpdateDto, Project>();

            // 3. Worker Mappings
            CreateMap<Worker, WorkerDto>();
            CreateMap<WorkerCreateUpdateDto, Worker>();

            // 4. ProjectPhase Mappings
            CreateMap<ProjectPhase, ProjectPhaseDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty));
            CreateMap<ProjectPhaseCreateUpdateDto, ProjectPhase>();

            // 5. Task Mappings
            CreateMap<Task, TaskDto>()
                .ForMember(dest => dest.PhaseName, opt => opt.MapFrom(src => 
                    src.ProjectPhase != null ? src.ProjectPhase.Emertimi : string.Empty));
            CreateMap<TaskCreateUpdateDto, Task>();

            // 6. TaskAssignment Mappings
            CreateMap<TaskAssignment, TaskAssignmentDto>()
                .ForMember(dest => dest.TaskName, opt => opt.MapFrom(src => 
                    src.Task != null ? src.Task.Emertimi : string.Empty))
                .ForMember(dest => dest.WorkerName, opt => opt.MapFrom(src => 
                    src.Worker != null ? $"{src.Worker.Emri} {src.Worker.Mbiemri}".Trim() : string.Empty));
            CreateMap<TaskAssignmentCreateUpdateDto, TaskAssignment>();

            // 7. Supplier Mappings
            CreateMap<Supplier, SupplierDto>();
            CreateMap<SupplierCreateUpdateDto, Supplier>();

            // 8. Material Mappings
            CreateMap<Material, MaterialDto>()
                .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => 
                    src.Supplier != null ? src.Supplier.Emertimi : string.Empty));
            CreateMap<MaterialCreateUpdateDto, Material>();

            // 9. MaterialUsage Mappings
            CreateMap<MaterialUsage, MaterialUsageDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty))
                .ForMember(dest => dest.MaterialName, opt => opt.MapFrom(src => 
                    src.Material != null ? src.Material.Emertimi : string.Empty))
                .ForMember(dest => dest.PhaseName, opt => opt.MapFrom(src => 
                    src.ProjectPhase != null ? src.ProjectPhase.Emertimi : string.Empty));
            CreateMap<MaterialUsageCreateUpdateDto, MaterialUsage>();

            // 10. Equipment Mappings
            CreateMap<Equipment, EquipmentDto>();
            CreateMap<EquipmentCreateUpdateDto, Equipment>();

            // 11. Invoice Mappings
            CreateMap<Invoice, InvoiceDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty))
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => 
                    src.Client != null ? $"{src.Client.Emri} {src.Client.MbiemriKompania}".Trim() : string.Empty));
            CreateMap<InvoiceCreateUpdateDto, Invoice>();
        }
    }
}
