using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Kanzie.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        
        [Required]
        public string FullName { get; set; } = null!;
        
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        
        // Onboarding Status
        public bool IsOnboardingCompleted { get; set; } = false;
        
        // Basic Info
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; } // Male, Female, Other, PreferNotToSay
        
        // Location
        public string? City { get; set; }
        
        // Interests (comma-separated category IDs or names)
        public string? Interests { get; set; }
        
        // Lifestyle Preferences
        public string? BudgetPreference { get; set; } // Economy, Medium, Premium
        public string? SocialPreference { get; set; } // Solo, Couple, SmallGroup, LargeGroup
        public string? FrequencyPreference { get; set; } // Daily, Weekly, BiWeekly, Monthly, Rarely
        
        // Activity Preferences
        public string? TimePreference { get; set; } // Day, Night, Both
        public string? AtmospherePreference { get; set; } // Quiet, Energetic, LiveMusic
        public string? DistancePreference { get; set; } // Near, Medium, Far
        
        // Special Preferences (stored as comma-separated values)
        public bool PetFriendly { get; set; } = false;
        public bool OutdoorPreference { get; set; } = false;
        public bool NonSmoking { get; set; } = false;
        public bool AccessibilityNeeded { get; set; } = false;
        
        // Navigation Properties
        public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
        public ICollection<Swipe> Swipes { get; set; } = new List<Swipe>();
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public ICollection<Friendship> Friendships { get; set; } = new List<Friendship>();
    }

    public class Venue
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = null!;
        
        public string? Description { get; set; }
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? ImageUrl { get; set; }
        
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public ICollection<Swipe> Swipes { get; set; } = new List<Swipe>();
    }

    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = null!;
        
        public string? Icon { get; set; }
        
        public ICollection<Venue>? Venues { get; set; }
    }

    public class Group
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = null!;
        
        public string InviteCode { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        
        public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }

    public class UserGroup
    {
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class Swipe
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int VenueId { get; set; }
        public Venue? Venue { get; set; }
        
        public bool IsLiked { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Message
    {
        public int Id { get; set; }
        
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        
        public int SenderId { get; set; }
        public User? Sender { get; set; }
        
        [Required]
        public string Content { get; set; } = null!;
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }

    public class Question
    {
        public int Id { get; set; }
        
        [Required]
        public string Content { get; set; } = null!;
        
        public string Type { get; set; } = "MultipleChoice"; // or "Range", "Boolean"
    }

    public class Answer
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int QuestionId { get; set; }
        public Question? Question { get; set; }
        
        [Required]
        public string Response { get; set; } = null!;
    }

    public class Friendship
    {
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int FriendId { get; set; }
        public User? Friend { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
