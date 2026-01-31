using System;

namespace Kanzie.Api.Models.Dtos
{
    public class UserLoginDto
    {
        public string Email { get; set; } = null!;
    }

    public class UserRegisterDto
    {
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsOnboardingCompleted { get; set; }
        public int SwipesCount { get; set; }
        public int GroupsCount { get; set; }
    }

    public class UserUpdateDto
    {
        public string FullName { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class InboxItemDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string LastMessage { get; set; } = null!;
        public string Time { get; set; } = null!;
        public string Avatar { get; set; } = null!;
        public bool Unread { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class FriendRequestDto
    {
        public int UserId { get; set; }
        public int? FriendId { get; set; }
        public string? FriendEmail { get; set; }
    }
}
