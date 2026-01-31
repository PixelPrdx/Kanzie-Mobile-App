using Kanzie.Api.Data;
using Kanzie.Api.Models;
using Kanzie.Api.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kanzie.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FriendshipsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("send-request")]
        public async Task<IActionResult> SendRequest([FromBody] FriendRequestDto dto)
        {
            var userId = dto.UserId;
            User? friend = null;
            if (dto.FriendId.HasValue)
            {
                friend = await _context.Users.FindAsync(dto.FriendId.Value);
            }
            else if (!string.IsNullOrEmpty(dto.FriendEmail))
            {
                friend = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.FriendEmail);
            }

            if (friend == null) return NotFound("Kullanıcı bulunamadı.");
            if (userId == friend.Id) return BadRequest("Kendini ekleyemezsin.");

            // Check if request already exists in either direction or if they are already friends
            var existing = await _context.Friendships
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friend.Id) || (f.UserId == friend.Id && f.FriendId == userId));
            
            if (existing != null) 
            {
                if (existing.Status == "Accepted") return BadRequest("Zaten arkadaşsınız.");
                return BadRequest("Zaten bekleyen bir istek var.");
            }

            var friendship = new Friendship
            {
                UserId = userId,
                FriendId = friend.Id,
                Status = "Pending"
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Arkadaşlık isteği gönderildi" });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers(string query, int currentUserId)
        {
            if (string.IsNullOrWhiteSpace(query)) return Ok(new List<UserDto>());

            var users = await _context.Users
                .Where(u => u.Id != currentUserId && (u.FullName.Contains(query) || u.Email.Contains(query)))
                .Take(20)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    AvatarUrl = u.AvatarUrl
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("accept-request")]
        public async Task<IActionResult> AcceptRequest([FromBody] FriendRequestDto dto)
        {
            var userId = dto.UserId;
            var friendId = dto.FriendId;

            // Note: In friend requests, logic is: Request sender is UserId, Target is FriendId.
            // When accepting, we are looking for a record where UserId = friendId (sender) and FriendId = userId (me)
            var friendship = await _context.Friendships.FirstOrDefaultAsync(f => f.UserId == friendId && f.FriendId == userId);
            
            if (friendship == null) return NotFound("İstek bulunamadı.");
            
            friendship.Status = "Accepted";
            
            // Create the reverse relationship for bidirectional friendship
            var reverseFriendship = new Friendship
            {
                UserId = userId,
                FriendId = friendId.Value,
                Status = "Accepted"
            };
            
            _context.Friendships.Add(reverseFriendship);
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Arkadaşlık isteği kabul edildi" });
        }

        [HttpGet("{userId}/list")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetFriends(int userId)
        {
            var friends = await _context.Friendships
                .Where(f => f.UserId == userId && f.Status == "Accepted")
                .Include(f => f.Friend)
                .Select(f => new UserDto
                {
                    Id = f.Friend.Id,
                    FullName = f.Friend.FullName,
                    Email = f.Friend.Email,
                    AvatarUrl = f.Friend.AvatarUrl
                })
                .ToListAsync();

            return Ok(friends);
        }

        [HttpGet("{userId}/pending")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetPendingRequests(int userId)
        {
            // Requests sent TO me (where I am FriendId)
            var requests = await _context.Friendships
                .Where(f => f.FriendId == userId && f.Status == "Pending")
                .Include(f => f.User)
                .Select(f => new UserDto
                {
                    Id = f.User.Id,
                    FullName = f.User.FullName,
                    Email = f.User.Email,
                    AvatarUrl = f.User.AvatarUrl
                })
                .ToListAsync();

            return Ok(requests);
        }
    }
}
