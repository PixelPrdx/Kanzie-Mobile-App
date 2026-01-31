using Kanzie.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kanzie.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Categories.Any())
            {
                return; // DB has been seeded
            }

            var categories = new Category[]
            {
                new Category { Name = "Kahve & Çalışma", Icon = "coffee" },
                new Category { Name = "Pub & Gece Hayatı", Icon = "beer" },
                new Category { Name = "Aktivite & Eğlence", Icon = "gamepad" },
                new Category { Name = "Yemek & Restoran", Icon = "restaurant" }
            };

            context.Categories.AddRange(categories);
            context.SaveChanges();

            var venues = new Venue[]
            {
                new Venue 
                { 
                    Name = "Kanzie Coffee Lab", 
                    Description = "Sakin bir çalışma ortamı ve harika 3. dalga kahveler.", 
                    Address = "Moda, İstanbul", 
                    CategoryId = categories[0].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
                },
                new Venue 
                { 
                    Name = "Antigravity Pub", 
                    Description = "Draft biralar ve canlı müzik için en iyi adres.", 
                    Address = "Beşiktaş, İstanbul", 
                    CategoryId = categories[1].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1514933651103-005eec06c04b"
                },
                new Venue 
                { 
                    Name = "VR Escape", 
                    Description = "Arkadaş grubunla unutulmaz bir VR deneyimi yaşa.", 
                    Address = "Kadıköy, İstanbul", 
                    CategoryId = categories[2].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac"
                }
            };

            context.Venues.AddRange(venues);
            context.SaveChanges();

            var questions = new Question[]
            {
                new Question { Content = "Gürültülü ortamları mı seversin yoksa sakin mi?", Type = "Boolean" },
                new Question { Content = "Bugün bütçen ne durumda? (1-5)", Type = "Range" },
                new Question { Content = "Alkol tüketiyor musun?", Type = "Boolean" }
            };

            context.Questions.AddRange(questions);
            context.SaveChanges();
        }
    }
}
