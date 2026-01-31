using Microsoft.AspNetCore.SignalR;
using Kanzie.Api.Data;
using Kanzie.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kanzie.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        public async Task JoinGroupChat(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task SendMessage(int groupId, int senderId, string content)
        {
            // Verify user is a member of the group
            var isMember = await _context.UserGroups
                .AnyAsync(ug => ug.UserId == senderId && ug.GroupId == groupId);
            
            if (!isMember)
            {
                await Clients.Caller.SendAsync("Error", "You are not a member of this group");
                return;
            }

            // Get sender info for the message
            var sender = await _context.Users.FindAsync(senderId);
            var senderName = sender?.FullName ?? "Unknown";

            var message = new Message
            {
                GroupId = groupId,
                SenderId = senderId,
                Content = content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Broadcast to the group with sender name
            await Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", new
            {
                id = message.Id,
                groupId = message.GroupId,
                senderId = message.SenderId,
                senderName = senderName,
                content = message.Content,
                sentAt = message.SentAt
            });
        }
    }
}
