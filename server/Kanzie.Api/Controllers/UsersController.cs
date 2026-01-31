using Kanzie.Api.Data;
using Kanzie.Api.Models;
using Kanzie.Api.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Kanzie.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null) return Unauthorized("User not found");
            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] UserRegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfileDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserGroups)
                .Include(u => u.Swipes)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var profile = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                IsOnboardingCompleted = user.IsOnboardingCompleted,
                SwipesCount = user.Swipes.Count(),
                GroupsCount = user.UserGroups.Count()
            };

            return Ok(profile);
        }

        [HttpPost("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto updateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FullName = updateDto.FullName;
            user.Bio = updateDto.Bio;
            user.AvatarUrl = updateDto.AvatarUrl;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/inbox")]
        public async Task<ActionResult<IEnumerable<InboxItemDto>>> GetInbox(int id)
        {
            var userGroups = await _context.UserGroups
                .Where(ug => ug.UserId == id)
                .Include(ug => ug.Group)
                .ThenInclude(g => g.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .ToListAsync();

            var inboxItems = userGroups.Select(ug => new InboxItemDto
            {
                Id = ug.Group.Id.ToString(),
                Name = ug.Group.Name,
                LastMessage = ug.Group.Messages.FirstOrDefault()?.Content ?? "No messages yet",
                Time = ug.Group.Messages.FirstOrDefault()?.SentAt.ToString("HH:mm") ?? "00:00",
                Avatar = $"https://i.pravatar.cc/150?u={ug.Group.Name}",
                Unread = false // Simplification
            }).ToList();

            return Ok(inboxItems);
        }
    }
}
