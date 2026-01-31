using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Kanzie.Api.Models.Dtos
{
    public class GroupCreateDto
    {
        [Required]
        public string Name { get; set; } = null!;
        
        [Required]
        public int CreatorUserId { get; set; }
        
        public List<int> MemberIds { get; set; } = new List<int>();
    }

    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string InviteCode { get; set; } = null!;
        public int MemberCount { get; set; }
    }
}
