using System.ComponentModel.DataAnnotations;

namespace ConstructionCompanyAPI.DTOs
{
    // === CLIENT DTOs ===
    public class ClientDto
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string MbiemriKompania { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefoni { get; set; }
        public string? Adresa { get; set; }
        public string LlojiKlientit { get; set; } = "Individual";
    }

    public class ClientCreateUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string MbiemriKompania { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [MaxLength(200)]
        public string? Adresa { get; set; }

        [Required]
        [MaxLength(50)]
        public string LlojiKlientit { get; set; } = "Individual";
    }

    // === PROJECT DTOs ===
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string? Pershkrimi { get; set; }
        public int KlientiId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? Lokacioni { get; set; }
        public decimal Buxheti { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
        public decimal ProgresiTotal { get; set; }
    }

    public class ProjectCreateUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        public int KlientiId { get; set; }

        [MaxLength(200)]
        public string? Lokacioni { get; set; }

        public decimal Buxheti { get; set; }

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Planifikim";

        public decimal ProgresiTotal { get; set; }
    }

    // === WORKER DTOs ===
    public class WorkerDto
    {
        public int Id { get; set; }
        public string Emri { get; set; } = string.Empty;
        public string Mbiemri { get; set; } = string.Empty;
        public string FullName => $"{Emri} {Mbiemri}";
        public string? Email { get; set; }
        public string? Telefoni { get; set; }
        public string Profesioni { get; set; } = string.Empty;
        public decimal PagaDitore { get; set; }
        public DateTime DataPunesimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class WorkerCreateUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Mbiemri { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [Required]
        [MaxLength(100)]
        public string Profesioni { get; set; } = string.Empty;

        public decimal PagaDitore { get; set; }

        public DateTime DataPunesimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Aktiv";
    }

    // === PHASE DTOs ===
    public class ProjectPhaseDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Emertimi { get; set; } = string.Empty;
        public string? Pershkrimi { get; set; }
        public int Rendi { get; set; }
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
        public decimal PerqindjaKompletimit { get; set; }
    }

    public class ProjectPhaseCreateUpdateDto
    {
        [Required]
        public int ProjektiId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        public int Rendi { get; set; }

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "E paplanifikuar";

        public decimal PerqindjaKompletimit { get; set; }
    }

    // === TASK DTOs ===
    public class TaskDto
    {
        public int Id { get; set; }
        public int FazaId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public string Emertimi { get; set; } = string.Empty;
        public string? Pershkrimi { get; set; }
        public string Prioriteti { get; set; } = string.Empty;
        public DateTime DataFillimit { get; set; }
        public DateTime? DataPerfundimit { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class TaskCreateUpdateDto
    {
        [Required]
        public int FazaId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        public string? Pershkrimi { get; set; }

        [Required]
        [MaxLength(50)]
        public string Prioriteti { get; set; } = "Mesatar";

        public DateTime DataFillimit { get; set; }

        public DateTime? DataPerfundimit { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "Pa filluar";
    }

    // === TASK ASSIGNMENT DTOs ===
    public class TaskAssignmentDto
    {
        public int Id { get; set; }
        public int DetyraId { get; set; }
        public string TaskName { get; set; } = string.Empty;
        public int PunetoriId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public DateTime DataCaktimit { get; set; }
        public decimal OretPunuara { get; set; }
    }

    public class TaskAssignmentCreateUpdateDto
    {
        [Required]
        public int DetyraId { get; set; }

        [Required]
        public int PunetoriId { get; set; }

        public DateTime DataCaktimit { get; set; }

        public decimal OretPunuara { get; set; }
    }

    // === SUPPLIER DTOs ===
    public class SupplierDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string? Kontakti { get; set; }
        public string? Email { get; set; }
        public string? Telefoni { get; set; }
        public string? Adresa { get; set; }
        public string? Specialiteti { get; set; }
    }

    public class SupplierCreateUpdateDto
    {
        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Kontakti { get; set; }

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Telefoni { get; set; }

        [MaxLength(200)]
        public string? Adresa { get; set; }

        [MaxLength(100)]
        public string? Specialiteti { get; set; }
    }

    // === MATERIAL DTOs ===
    public class MaterialDto
    {
        public int Id { get; set; }
        public string Emertimi { get; set; } = string.Empty;
        public string NjesiaMatese { get; set; } = string.Empty;
        public decimal CmimiNjesi { get; set; }
        public int FurnitoriId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public decimal SasiaStokut { get; set; }
        public string? Kategoria { get; set; }
    }

    public class MaterialCreateUpdateDto
    {
        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string NjesiaMatese { get; set; } = "Cope";

        public decimal CmimiNjesi { get; set; }

        [Required]
        public int FurnitoriId { get; set; }

        public decimal SasiaStokut { get; set; }

        [MaxLength(100)]
        public string? Kategoria { get; set; }
    }

    // === MATERIAL USAGE DTOs ===
    public class MaterialUsageDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int MaterialiId { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public int FazaId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public decimal Sasia { get; set; }
        public DateTime DataPerdorimit { get; set; }
    }

    public class MaterialUsageCreateUpdateDto
    {
        [Required]
        public int ProjektiId { get; set; }

        [Required]
        public int MaterialiId { get; set; }

        [Required]
        public int FazaId { get; set; }

        public decimal Sasia { get; set; }

        public DateTime DataPerdorimit { get; set; }
    }

    // === EQUIPMENT DTOs ===
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
        [Required]
        [MaxLength(150)]
        public string Emertimi { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Lloji { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "I Lire";

        public decimal KostojaDitore { get; set; }

        public DateTime DataBlerjes { get; set; }
    }

    // === INVOICE DTOs ===
    public class InvoiceDto
    {
        public int Id { get; set; }
        public int ProjektiId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int KlientiId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public decimal Shuma { get; set; }
        public string? Pershkrimi { get; set; }
        public DateTime DataFatures { get; set; }
        public DateTime? DataPageses { get; set; }
        public string Statusi { get; set; } = string.Empty;
    }

    public class InvoiceCreateUpdateDto
    {
        [Required]
        public int ProjektiId { get; set; }

        [Required]
        public int KlientiId { get; set; }

        public decimal Shuma { get; set; }

        public string? Pershkrimi { get; set; }

        public DateTime DataFatures { get; set; }

        public DateTime? DataPageses { get; set; }

        [Required]
        [MaxLength(50)]
        public string Statusi { get; set; } = "E papaguar";
    }
}
