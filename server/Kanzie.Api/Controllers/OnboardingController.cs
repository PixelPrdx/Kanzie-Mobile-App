using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanzie.Api.Data;
using Kanzie.Api.Models;

namespace Kanzie.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OnboardingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OnboardingController(AppDbContext context)
        {
            _context = context;
        }

        public class OnboardingDto
        {
            // Basic Info
            public DateTime? BirthDate { get; set; }
            public string? Gender { get; set; }
            
            // Location
            public string? City { get; set; }
            
            // Interests
            public List<string>? Interests { get; set; }
            
            // Lifestyle
            public string? BudgetPreference { get; set; }
            public string? SocialPreference { get; set; }
            public string? FrequencyPreference { get; set; }
            
            // Activity Preferences
            public string? TimePreference { get; set; }
            public string? AtmospherePreference { get; set; }
            public string? DistancePreference { get; set; }
            
            // Special Preferences
            public bool PetFriendly { get; set; }
            public bool OutdoorPreference { get; set; }
            public bool NonSmoking { get; set; }
            public bool AccessibilityNeeded { get; set; }
        }

        [HttpPost("{userId}/complete")]
        public async Task<IActionResult> CompleteOnboarding(int userId, [FromBody] OnboardingDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            // Basic Info
            user.BirthDate = dto.BirthDate;
            user.Gender = dto.Gender;
            
            // Location
            user.City = dto.City;
            
            // Interests (store as comma-separated)
            user.Interests = dto.Interests != null ? string.Join(",", dto.Interests) : null;
            
            // Lifestyle
            user.BudgetPreference = dto.BudgetPreference;
            user.SocialPreference = dto.SocialPreference;
            user.FrequencyPreference = dto.FrequencyPreference;
            
            // Activity Preferences
            user.TimePreference = dto.TimePreference;
            user.AtmospherePreference = dto.AtmospherePreference;
            user.DistancePreference = dto.DistancePreference;
            
            // Special Preferences
            user.PetFriendly = dto.PetFriendly;
            user.OutdoorPreference = dto.OutdoorPreference;
            user.NonSmoking = dto.NonSmoking;
            user.AccessibilityNeeded = dto.AccessibilityNeeded;
            
            // Mark onboarding as completed
            user.IsOnboardingCompleted = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Onboarding tamamlandı!", user.Id });
        }

        [HttpGet("{userId}/status")]
        public async Task<IActionResult> GetOnboardingStatus(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(new { 
                isCompleted = user.IsOnboardingCompleted,
                userId = user.Id
            });
        }
    }
}
