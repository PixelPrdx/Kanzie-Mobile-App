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
        private readonly IGooglePlacesService _googlePlaces;

        public class GroupSuggestion
        {
            public int VenueId { get; set; }
            public int MatchCount { get; set; } // How many people in the group liked it
        }

        public VenueService(AppDbContext context, IGooglePlacesService googlePlaces)
        {
            _context = context;
            _googlePlaces = googlePlaces;
        }

        public async Task<IEnumerable<VenueDto>> GetNextVenuesAsync(int userId, int count = 10)
        {
            // 1. Get IDs of venues the user has already swiped on
            var swipedVenueIds = await _context.Swipes
                .Where(s => s.UserId == userId)
                .Select(s => s.VenueId)
                .ToListAsync();

            // 2. Fetch available local venues
            var localVenues = await _context.Venues
                .Include(v => v.Category)
                .Where(v => !swipedVenueIds.Contains(v.Id))
                .Take(count)
                .ToListAsync();

            // 3. If we don't have enough venues, fetch from Google
            if (localVenues.Count < count / 2) // Threshold to fetch more
            {
                await FetchAndSaveNewVenuesFromGoogle(userId);
                
                // Refresh local venues list after fetching
                localVenues = await _context.Venues
                    .Include(v => v.Category)
                    .Where(v => !swipedVenueIds.Contains(v.Id))
                    .Take(count)
                    .ToListAsync();
            }

            return localVenues.Select(v => new VenueDto
            {
                Id = v.Id,
                Name = v.Name,
                Description = v.Description,
                Address = v.Address,
                ImageUrl = v.ImageUrl,
                CategoryName = v.Category != null ? v.Category.Name : "General"
            });
        }

        private async Task FetchAndSaveNewVenuesFromGoogle(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            // Simple mapping: Use first interest or default
            string googleType = "restaurant";
            int categoryId = 4; // Default to Dining

            if (!string.IsNullOrEmpty(user.Interests))
            {
                var firstInterestId = user.Interests.Split(',').FirstOrDefault();
                if (int.TryParse(firstInterestId, out int id))
                {
                    categoryId = id;
                    googleType = id switch
                    {
                        1 => "cafe",
                        2 => "bar",
                        3 => "amusement_center",
                        4 => "restaurant",
                        _ => "restaurant"
                    };
                }
            }

            // For now, use a default location (e.g., Istanbul Center) if user city is unspecified
            // In a real app, we'd use the user's last known Lat/Lng
            double lat = 41.0082;
            double lng = 28.9784;

            var googleResults = await _googlePlaces.SearchNearbyAsync(lat, lng, googleType);

            foreach (var result in googleResults)
            {
                // Check if already exists by GooglePlaceId
                if (await _context.Venues.AnyAsync(v => v.GooglePlaceId == result.Id))
                    continue;

                var photoUrl = "";
                if (result.Photos != null && result.Photos.Any())
                {
                    photoUrl = _googlePlaces.GetPhotoUrl(result.Photos.First().Name);
                }

                var venue = new Venue
                {
                    Name = result.DisplayName.Text,
                    Description = result.EditorialSummary?.Text ?? $"{result.DisplayName.Text} - Gerçek bir Google Maps mekanı.",
                    Address = result.FormattedAddress,
                    Latitude = result.Location.Latitude,
                    Longitude = result.Location.Longitude,
                    ImageUrl = photoUrl,
                    CategoryId = categoryId,
                    GooglePlaceId = result.Id
                };

                _context.Venues.Add(venue);
            }

            await _context.SaveChangesAsync();
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
