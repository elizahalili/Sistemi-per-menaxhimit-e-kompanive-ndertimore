using System;

namespace backend.DTOs
{
    // ================= CLIENT DTOS =================
    public class ClientDto
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string MbiemriKompania { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string LlojiKlientit { get; set; } = string.Empty;
    }

    public class ClientCreateUpdateDto
    {
        public string Emri { get; set; } = string.Empty;
        public string MbiemriKompania { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string LlojiKlientit { get; set; } = string.Empty;
    }

    // ================= PROJECT DTOS =================
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int KlientiId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string Lokacioni { get; set; } = string.Empty;
        public decimal Buxheti { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
        public int ProgresiTotal { get; set; }
    }

    public class ProjectCreateUpdateDto
    {
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int KlientiId { get; set; }
        public string Lokacioni { get; set; } = string.Empty;
        public decimal Buxheti { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "Planifikim";
        public int ProgresiTotal { get; set; }
    }

    // ================= WORKER DTOS =================
    public class WorkerDto
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string Mbiemri { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Profesioni { get; set; } = string.Empty;
        public decimal PagaDitore { get; set; }
        public DateTime DataPunesimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class WorkerCreateUpdateDto
    {
        public string Emri { get; set; } = string.Empty;
        public string Mbiemri { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Profesioni { get; set; } = string.Empty;
        public decimal PagaDitore { get; set; }
        public DateTime DataPunesimit { get; set; }
        public string Statusi { get; set; } = "Aktiv";
    }

    // ================= PROJECT PHASE DTOS =================
    public class ProjectPhaseDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int Rendi { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
        public int PerqindjaKompletimit { get; set; }
    }

    public class ProjectPhaseCreateUpdateDto
    {
        public int ProjektiId { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public int Rendi { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "E paplanifikuar";
        public int PerqindjaKompletimit { get; set; }
    }

    // ================= TASK DTOS =================
    public class TaskDto
    {
        public int Id { get; set; }
        public int FazaId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public string Prioriteti { get; set; } = string.Empty;
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class TaskCreateUpdateDto
    {
        public int FazaId { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Pershkrimi { get; set; } = string.Empty;
        public string Prioriteti { get; set; } = "Mesatar";
        public DateTime DataFillimit { get; set; }
        public DateTime DataPerfundimit { get; set; }
        public string Statusi { get; set; } = "E paplanifikuar";
    }

    // ================= TASK ASSIGNMENT DTOS =================
    public class TaskAssignmentDto
    {
        public int Id { get; set; }
        public int DetyraId { get; set; }
        public string TaskName { get; set; } = string.Empty;
        public int PunetoriId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public DateTime DataCaktimit { get; set; }
        public double OretPunuara { get; set; }
    }

    public class TaskAssignmentCreateUpdateDto
    {
        public int DetyraId { get; set; }
        public int PunetoriId { get; set; }
        public DateTime DataCaktimit { get; set; }
        public double OretPunuara { get; set; }
    }

    // ================= SUPPLIER DTOS =================
    public class SupplierDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Kontakti { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string Specialiteti { get; set; } = string.Empty;
    }

    public class SupplierCreateUpdateDto
    {
        public string Emertimi { get; set; } = string.Empty;
        public string Kontakti { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoni { get; set; } = string.Empty;
        public string Adresa { get; set; } = string.Empty;
        public string Specialiteti { get; set; } = string.Empty;
    }

    // ================= MATERIAL DTOS =================
    public class MaterialDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string NjesiaMatese { get; set; } = string.Empty;
        public decimal CmimiNjesi { get; set; }
        public int FurnitoriId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public double SasiaStokut { get; set; }
        public string Kategoria { get; set; } = string.Empty;
    }

    public class MaterialCreateUpdateDto
    {
        public string Emertimi { get; set; } = string.Empty;
        public string NjesiaMatese { get; set; } = string.Empty;
        public decimal CmimiNjesi { get; set; }
        public int FurnitoriId { get; set; }
        public double SasiaStokut { get; set; }
        public string Kategoria { get; set; } = string.Empty;
    }

    // ================= MATERIAL USAGE DTOS =================
    public class MaterialUsageDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int MaterialiId { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public int FazaId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public double Sasia { get; set; }
        public DateTime DataPerdorimit { get; set; }
    }

    public class MaterialUsageCreateUpdateDto
    {
        public int ProjektiId { get; set; }
        public int MaterialiId { get; set; }
        public int FazaId { get; set; }
        public double Sasia { get; set; }
        public DateTime DataPerdorimit { get; set; }
    }

    // ================= EQUIPMENT DTOS =================
    public class EquipmentDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string Lloji { get; set; } = string.Empty;
        public string Statusi { get; set; } = string.Empty;
        public decimal KostojaDitore { get; set; }
        public DateTime DataBlerjes { get; set; }
    }

    public class EquipmentCreateUpdateDto
    {
        public string Emertimi { get; set; } = string.Empty;
        public string Lloji { get; set; } = string.Empty;
        public string Statusi { get; set; } = "I Lire";
        public decimal KostojaDitore { get; set; }
        public DateTime DataBlerjes { get; set; }
    }

    // ================= INVOICE DTOS =================
    public class InvoiceDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int KlientiId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public decimal Shuma { get; set; }
        public string Pershkrimi { get; set; } = string.Empty;
        public DateTime DataFatures { get; set; }
        public DateTime? DataPageses { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class InvoiceCreateUpdateDto
    {
        public int ProjektiId { get; set; }
        public int KlientiId { get; set; }
        public decimal Shuma { get; set; }
        public string Pershkrimi { get; set; } = string.Empty;
        public DateTime DataFatures { get; set; }
        public DateTime? DataPageses { get; set; }
        public string Statusi { get; set; } = "E papaguar";
    }

    // ================= PAGINATION AND GENERAL QUERYDTOS =================
    public class PaginatedResponseDto<T>
    {
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public System.Collections.Generic.IEnumerable<T> Items { get; set; } = new System.Collections.Generic.List<T>();
    }
}
