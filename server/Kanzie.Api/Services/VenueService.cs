using Kanzie.Api.Data;
using Kanzie.Api.Models;
using Kanzie.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Kanzie.Api.Services
{
    public interface IVenueService
    {
        Task<IEnumerable<VenueDto>> GetNextVenuesAsync(int userId, int count = 10);
        Task<bool> RecordSwipeAsync(SwipeCreateDto swipeDto);
    }

    public class VenueService : IVenueService
    {
        private readonly AppDbContext _context;

        public class GroupSuggestion
        {
            public int VenueId { get; set; }
            public int MatchCount { get; set; } // How many people in the group liked it
        }

        public VenueService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VenueDto>> GetNextVenuesAsync(int userId, int count = 10)
        {
            // Get IDs of venues the user has already swiped on
            var swipedVenueIds = await _context.Swipes
                .Where(s => s.UserId == userId)
                .Select(s => s.VenueId)
                .ToListAsync();

            // Fetch venues not in that list
            return await _context.Venues
                .Include(v => v.Category)
                .Where(v => !swipedVenueIds.Contains(v.Id))
                .Take(count)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    CategoryName = v.Category != null ? v.Category.Name : "General"
                })
                .ToListAsync();
        }

        public async Task<bool> RecordSwipeAsync(SwipeCreateDto swipeDto)
        {
            var swipe = new Swipe
            {
                UserId = swipeDto.UserId,
                VenueId = swipeDto.VenueId,
                IsLiked = swipeDto.IsLiked,
                CreatedAt = DateTime.UtcNow
            };

            _context.Swipes.Add(swipe);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<VenueDto>> GetGroupSuggestionsAsync(int groupId)
        {
            // Logic: High match score venues that most members liked
            var groupMemberIds = await _context.UserGroups
                .Where(ug => ug.GroupId == groupId)
                .Select(ug => ug.UserId)
                .ToListAsync();

            var suggestedVenues = await _context.Swipes
                .Where(s => groupMemberIds.Contains(s.UserId) && s.IsLiked)
                .GroupBy(s => s.VenueId)
                .Select(g => new { VenueId = g.Key, LikeCount = g.Count() })
                .OrderByDescending(x => x.LikeCount)
                .Take(5)
                .ToListAsync();

            var venueIds = suggestedVenues.Select(s => s.VenueId).ToList();

            return await _context.Venues
                .Include(v => v.Category)
                .Where(v => venueIds.Contains(v.Id))
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    CategoryName = v.Category != null ? v.Category.Name : "General"
                })
                .ToListAsync();
        }
    }
}
