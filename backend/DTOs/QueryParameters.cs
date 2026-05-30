namespace backend.DTOs
{
    public class QueryParameters
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public int? ProjektiId { get; set; }
        public int? KlientiId { get; set; }
        public int? FazaId { get; set; }
        public string? SortBy { get; set; }
        public string SortOrder { get; set; } = "asc"; // "asc" or "desc"
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
