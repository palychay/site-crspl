using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SneakerStoreAPI.Data;
using SneakerStoreAPI.Models;

namespace SneakerStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
                
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting orders: {ex.Message}");
                // Возвращаем пустой список вместо ошибки 500
                return Ok(new List<Order>());
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            return order == null ? NotFound() : order;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            try
            {
                if (order.OrderItems == null || !order.OrderItems.Any())
                    return BadRequest("Order must contain at least one item");
                
                order.OrderDate = DateTime.Now;
                order.TotalAmount = order.OrderItems?.Sum(item => item.Quantity * item.UnitPrice) ?? 0;
                
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetOrder", new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("revenue")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetRevenue(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Orders.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(o => o.OrderDate >= startDate.Value);
                
                if (endDate.HasValue)
                    query = query.Where(o => o.OrderDate <= endDate.Value);

                var orders = await query
                    .Where(o => o.Status != OrderStatus.Cancelled)
                    .ToListAsync();

                var totalRevenue = orders.Sum(o => o.TotalAmount);
                var orderCount = orders.Count;

                return Ok(new
                {
                    TotalOrders = orderCount,
                    TotalRevenue = totalRevenue,
                    AverageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting revenue: {ex.Message}");
                return Ok(new
                {
                    TotalOrders = 0,
                    TotalRevenue = 0,
                    AverageOrderValue = 0
                });
            }
        }

        private bool OrderExists(int id) => _context.Orders.Any(e => e.Id == id);
    }
}