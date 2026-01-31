namespace Kanzie.Api.Models.Dtos
{
    public class VenueDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public string? CategoryName { get; set; }
    }

    public class SwipeCreateDto
    {
        public int UserId { get; set; }
        public int VenueId { get; set; }
        public bool IsLiked { get; set; }
    }
}
