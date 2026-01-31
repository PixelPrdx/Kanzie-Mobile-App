using Kanzie.Api.Models.Dtos;
using Kanzie.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Kanzie.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly IVenueService _venueService;

        public VenuesController(IVenueService venueService)
        {
            _venueService = venueService;
        }

        [HttpGet("next")]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetNextVenues([FromQuery] int userId)
        {
            var venues = await _venueService.GetNextVenuesAsync(userId);
            return Ok(venues);
        }

        [HttpPost("swipe")]
        public async Task<IActionResult> Swipe([FromBody] SwipeCreateDto swipeDto)
        {
            if (swipeDto == null) return BadRequest();

            var result = await _venueService.RecordSwipeAsync(swipeDto);
            if (result) return Ok(new { message = "Swipe recorded successfully" });

            return StatusCode(500, "Error recording swipe");
        }

        [HttpGet("group-suggestions/{groupId}")]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetGroupSuggestions(int groupId)
        {
            // Note: In a real app, we would verify if the user belongs to the group
            var suggestions = await ((VenueService)_venueService).GetGroupSuggestionsAsync(groupId);
            return Ok(suggestions);
        }
    }
}
