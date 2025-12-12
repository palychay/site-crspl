using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SneakerStoreAPI.Data;
using SneakerStoreAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SneakerStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginModel model)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username);

                if (user == null)
                {
                    return Unauthorized(new { message = "Пользователь с таким именем не найден" });
                }

                if (user.PasswordHash != model.Password)
                {
                    return Unauthorized(new { message = "Неверный пароль" });
                }

                // Проверяем, что пользователь администратор
                if (user.Role != "admin")
                {
                    return Unauthorized(new { message = "Доступ разрешен только администраторам" });
                }

                var token = GenerateJwtToken(user);
                
                return Ok(new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    Expires = DateTime.UtcNow.AddDays(7)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка сервера: {ex.Message}" });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterModel model)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                {
                    return BadRequest(new { message = "Пользователь с таким именем уже существует" });
                }

                if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                {
                    return BadRequest(new { message = "Пользователь с таким email уже существует" });
                }

                // Все новые пользователи создаются как администраторы
                var user = new User
                {
                    Username = model.Username,
                    Email = model.Email,
                    PasswordHash = model.Password,
                    Role = "admin"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);
                
                return Ok(new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    Expires = DateTime.UtcNow.AddDays(7)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка сервера: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("your-256-bit-secret-key-minimum-32-characters-long-here");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("userId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}