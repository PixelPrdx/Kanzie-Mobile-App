namespace Kanzie.Api.Models.Dtos
{
    public class AnswerCreateDto
    {
        public int UserId { get; set; }
        public int QuestionId { get; set; }
        public string SelectedOptionId { get; set; } = null!;
    }
}
