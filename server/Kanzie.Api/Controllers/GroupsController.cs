using Kanzie.Api.Data;
using Kanzie.Api.Models;
using Kanzie.Api.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kanzie.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<ActionResult<Group>> CreateGroup([FromBody] GroupCreateDto createDto)
        {
            var group = new Group { Name = createDto.Name };
            _context.Groups.Add(group);
            await _context.SaveChangesAsync(); // Save to get Group ID

            // Add Creator
            _context.UserGroups.Add(new UserGroup 
            { 
                UserId = createDto.CreatorUserId, 
                GroupId = group.Id 
            });

            // Add Friends
            if (createDto.MemberIds != null && createDto.MemberIds.Any())
            {
                foreach (var memberId in createDto.MemberIds)
                {
                    // Avoid adding creator twice if they selected themselves for some reason
                    if (memberId != createDto.CreatorUserId)
                    {
                        _context.UserGroups.Add(new UserGroup
                        {
                            UserId = memberId,
                            GroupId = group.Id
                        }); 
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(group);
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinGroup([FromQuery] int userId, [FromQuery] string inviteCode)
        {
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.InviteCode == inviteCode);
            if (group == null) return NotFound("Invalid invite code");

            var userGroup = new UserGroup
            {
                UserId = userId,
                GroupId = group.Id
            };

            _context.UserGroups.Add(userGroup);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully joined the group", groupName = group.Name });
        }

        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<User>>> GetMembers(int id)
        {
            var members = await _context.UserGroups
                .Where(ug => ug.GroupId == id)
                .Select(ug => ug.User)
                .ToListAsync();

            return Ok(members);
        }
        [HttpGet("{id}/messages")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetMessages(int id)
        {
            var messages = await _context.Messages
                .Where(m => m.GroupId == id)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.GroupId,
                    m.SenderId,
                    m.Content,
                    m.SentAt,
                    SenderName = m.Sender.FullName // Include sender name
                })
                .ToListAsync();

            return Ok(messages);
        }
        [HttpPost("{id}/add-members")]
        public async Task<IActionResult> AddMembers(int id, [FromBody] List<int> memberIds)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound("Grup bulunamadı.");

            if (memberIds == null || !memberIds.Any())
                return BadRequest("Eklenecek üye seçilmedi.");

            var currentMemberIds = await _context.UserGroups
                .Where(ug => ug.GroupId == id)
                .Select(ug => ug.UserId)
                .ToListAsync();

            foreach (var memberId in memberIds)
            {
                if (!currentMemberIds.Contains(memberId))
                {
                    _context.UserGroups.Add(new UserGroup
                    {
                        UserId = memberId,
                        GroupId = id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Üyeler başarıyla eklendi." });
        }
    }
}
