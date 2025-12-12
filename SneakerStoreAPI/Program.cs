using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SneakerStoreAPI.Data;
using SneakerStoreAPI.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Sneaker Store API", 
        Version = "v1",
        Description = "API for managing sneakers and orders with JWT authentication"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add JWT Authentication
var key = Encoding.ASCII.GetBytes("your-256-bit-secret-key-minimum-32-characters-long-here");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireClaim("role", "user"));
    options.AddPolicy("Authenticated", policy => policy.RequireAuthenticatedUser());
});

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sneaker Store API v1");
        c.RoutePrefix = "swagger";
    });
}

//app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Ensure database is created and migrations are applied
    try
    {
        dbContext.Database.Migrate();
        Console.WriteLine("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error applying migrations: {ex.Message}");
        // Create database if migrations fail
        dbContext.Database.EnsureCreated();
    }
    
    // Seed data if tables are empty
    // Seed data if tables are empty
if (!dbContext.Sneakers.Any())
{
    dbContext.Sneakers.AddRange(
        new Sneaker
        {
            Id = 1,
            Name = "Air Jordan 1 Retro High",
            Brand = "Nike",
            Model = "Jordan 1",
            Size = 42,
            Color = "Black/Red",
            Price = 15000,
            StockQuantity = 10,
            ReleaseDate = new DateTime(2023, 1, 15),
            IsLimitedEdition = false
        },
        new Sneaker
        {
            Id = 2,
            Name = "Yeezy Boost 350 V2",
            Brand = "Adidas",
            Model = "Yeezy 350",
            Size = 43,
            Color = "Zebra",
            Price = 25000,
            StockQuantity = 5,
            ReleaseDate = new DateTime(2023, 3, 20),
            IsLimitedEdition = true
        },
        new Sneaker
        {
            Id = 3,
            Name = "Classic Leather",
            Brand = "Reebok",
            Model = "Classic",
            Size = 41,
            Color = "White",
            Price = 8000,
            StockQuantity = 20,
            ReleaseDate = new DateTime(2022, 6, 10),
            IsLimitedEdition = false
        },
        new Sneaker
        {
            Id = 4,
            Name = "Air Max 97",
            Brand = "Nike",
            Model = "Air Max",
            Size = 44,
            Color = "Silver Bullet",
            Price = 18000,
            StockQuantity = 8,
            ReleaseDate = new DateTime(2023, 5, 15),
            IsLimitedEdition = true
        },
        new Sneaker
        {
            Id = 5,
            Name = "Ultraboost 22",
            Brand = "Adidas",
            Model = "Ultraboost",
            Size = 42,
            Color = "Black",
            Price = 14000,
            StockQuantity = 15,
            ReleaseDate = new DateTime(2023, 2, 28),
            IsLimitedEdition = false
        },
        new Sneaker
        {
            Id = 6,
            Name = "Chuck Taylor All Star",
            Brand = "Converse",
            Model = "All Star",
            Size = 40,
            Color = "Red",
            Price = 5000,
            StockQuantity = 30,
            ReleaseDate = new DateTime(2022, 12, 1),
            IsLimitedEdition = false
        },
        new Sneaker
        {
            Id = 7,
            Name = "Gel-Kayano 28",
            Brand = "Asics",
            Model = "Kayano",
            Size = 43,
            Color = "Blue/Orange",
            Price = 12000,
            StockQuantity = 12,
            ReleaseDate = new DateTime(2023, 4, 10),
            IsLimitedEdition = false
        }
    );
}

if (!dbContext.Orders.Any())
{
    dbContext.Orders.AddRange(
        new Order
        {
            Id = 1,
            CustomerName = "Иван Иванов",
            CustomerEmail = "ivan@example.com",
            CustomerPhone = "+79991234567",
            OrderDate = DateTime.Now.AddDays(-10),
            ShippingAddress = "ул. Ленина, д. 10, кв. 5",
            Status = OrderStatus.Delivered,
            TotalAmount = 15000,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = 1,
                    OrderId = 1,
                    SneakerId = 1,
                    SneakerName = "Air Jordan 1 Retro High",
                    Quantity = 1,
                    UnitPrice = 15000,
                    Size = 42
                }
            }
        },
        new Order
        {
            Id = 2,
            CustomerName = "Петр Петров",
            CustomerEmail = "petr@example.com",
            CustomerPhone = "+79992345678",
            OrderDate = DateTime.Now.AddDays(-5),
            ShippingAddress = "ул. Пушкина, д. 25",
            Status = OrderStatus.Processing,
            TotalAmount = 25000,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = 2,
                    OrderId = 2,
                    SneakerId = 2,
                    SneakerName = "Yeezy Boost 350 V2",
                    Quantity = 1,
                    UnitPrice = 25000,
                    Size = 43
                }
            }
        },
        new Order
        {
            Id = 3,
            CustomerName = "Алексей Смирнов",
            CustomerEmail = "alexey@example.com",
            CustomerPhone = "+79993456789",
            OrderDate = DateTime.Now.AddDays(-1),
            ShippingAddress = "пр. Мира, д. 15, кв. 12",
            Status = OrderStatus.Pending,
            TotalAmount = 16000,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = 3,
                    OrderId = 3,
                    SneakerId = 1,
                    SneakerName = "Air Jordan 1 Retro High",
                    Quantity = 1,
                    UnitPrice = 15000,
                    Size = 42
                }
            }
        }
    );
}

if (!dbContext.Users.Any())
{
    dbContext.Users.AddRange(
        new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@sneakerstore.com",
            PasswordHash = "admin123",
            Role = "admin"
        },
        new User
        {
            Id = 2,
            Username = "manager",
            Email = "manager@sneakerstore.com",
            PasswordHash = "manager123",
            Role = "admin"
        }
    );
}

dbContext.SaveChanges();
Console.WriteLine("Database seeded successfully.");
}

app.Run();