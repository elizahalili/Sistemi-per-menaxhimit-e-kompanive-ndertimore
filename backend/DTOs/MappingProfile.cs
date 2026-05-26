using AutoMapper;
using ConstructionCompanyAPI.Models;

namespace ConstructionCompanyAPI.DTOs
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // === Client Mapping ===
            CreateMap<Client, ClientDto>();
            CreateMap<ClientCreateUpdateDto, Client>();

            // === Project Mapping ===
            CreateMap<Project, ProjectDto>()
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => 
                    src.Client != null ? $"{src.Client.Emri} {src.Client.MbiemriKompania}" : string.Empty));
            CreateMap<ProjectCreateUpdateDto, Project>();

            // === Worker Mapping ===
            CreateMap<Worker, WorkerDto>();
            CreateMap<WorkerCreateUpdateDto, Worker>();

            // === Phase Mapping ===
            CreateMap<ProjectPhase, ProjectPhaseDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty));
            CreateMap<ProjectPhaseCreateUpdateDto, ProjectPhase>();

            // === Task Mapping ===
            CreateMap<Models.Task, TaskDto>()
                .ForMember(dest => dest.PhaseName, opt => opt.MapFrom(src => 
                    src.Phase != null ? src.Phase.Emertimi : string.Empty));
            CreateMap<TaskCreateUpdateDto, Models.Task>();

            // === TaskAssignment Mapping ===
            CreateMap<TaskAssignment, TaskAssignmentDto>()
                .ForMember(dest => dest.TaskName, opt => opt.MapFrom(src => 
                    src.Task != null ? src.Task.Emertimi : string.Empty))
                .ForMember(dest => dest.WorkerName, opt => opt.MapFrom(src => 
                    src.Worker != null ? $"{src.Worker.Emri} {src.Worker.Mbiemri}" : string.Empty));
            CreateMap<TaskAssignmentCreateUpdateDto, TaskAssignment>();

            // === Supplier Mapping ===
            CreateMap<Supplier, SupplierDto>();
            CreateMap<SupplierCreateUpdateDto, Supplier>();

            // === Material Mapping ===
            CreateMap<Material, MaterialDto>()
                .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => 
                    src.Supplier != null ? src.Supplier.Emertimi : string.Empty));
            CreateMap<MaterialCreateUpdateDto, Material>();

            // === MaterialUsage Mapping ===
            CreateMap<MaterialUsage, MaterialUsageDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty))
                .ForMember(dest => dest.MaterialName, opt => opt.MapFrom(src => 
                    src.Material != null ? src.Material.Emertimi : string.Empty))
                .ForMember(dest => dest.PhaseName, opt => opt.MapFrom(src => 
                    src.Phase != null ? src.Phase.Emertimi : string.Empty));
            CreateMap<MaterialUsageCreateUpdateDto, MaterialUsage>();

            // === Equipment Mapping ===
            CreateMap<Equipment, EquipmentDto>();
            CreateMap<EquipmentCreateUpdateDto, Equipment>();

            // === Invoice Mapping ===
            CreateMap<Invoice, InvoiceDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => 
                    src.Project != null ? src.Project.Emertimi : string.Empty))
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => 
                    src.Client != null ? $"{src.Client.Emri} {src.Client.MbiemriKompania}" : string.Empty));
            CreateMap<InvoiceCreateUpdateDto, Invoice>();
        }
    }
}
