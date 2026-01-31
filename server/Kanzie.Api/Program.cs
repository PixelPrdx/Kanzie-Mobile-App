using Microsoft.EntityFrameworkCore;
using Kanzie.Api.Data;
using Kanzie.Api.Services;
using Kanzie.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins("http://localhost:8081", "http://localhost:19006", "http://localhost:3000", "exp://192.168.1.100:8081")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddScoped<IVenueService, VenueService>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Kanzie API V1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app root
    });

    // Seed the database
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
}

app.UseCors("AllowAll");
app.UseStaticFiles();

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

// Simple health check
app.MapGet("/health", () => Results.Ok(new { Status = "Kanzie API is alive!" }));

app.Run();
