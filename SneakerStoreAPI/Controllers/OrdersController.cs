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
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);
            return order == null ? NotFound() : order;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            // Validate sneakers and check stock
            foreach (var item in order.OrderItems)
            {
                var sneaker = await _context.Sneakers.FindAsync(item.SneakerId);
                if (sneaker == null)
                    return BadRequest($"Sneaker with ID {item.SneakerId} not found");
                
                if (sneaker.StockQuantity < item.Quantity)
                    return BadRequest($"Insufficient stock for {sneaker.Name}");
                
                sneaker.StockQuantity -= item.Quantity;
            }

            order.OrderDate = DateTime.Now;
            order.TotalAmount = order.OrderItems.Sum(item => item.Quantity * item.UnitPrice);
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        [HttpGet("revenue")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetRevenue(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
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

        [HttpGet("customer/{email}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(string email)
        {
            var orders = await _context.Orders
                .Where(o => o.CustomerEmail == email)
                .Include(o => o.OrderItems)
                .ToListAsync();

            return orders.Any() ? orders : NotFound();
        }

        private bool OrderExists(int id) => _context.Orders.Any(e => e.Id == id);
    }
}