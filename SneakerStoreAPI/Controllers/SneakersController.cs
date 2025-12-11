using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SneakerStoreAPI.Data;
using SneakerStoreAPI.Models;

namespace SneakerStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SneakersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SneakersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sneaker>>> GetSneakers()
        {
            return await _context.Sneakers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sneaker>> GetSneaker(int id)
        {
            var sneaker = await _context.Sneakers.FindAsync(id);
            return sneaker == null ? NotFound() : sneaker;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Sneaker>> PostSneaker(Sneaker sneaker)
        {
            sneaker.Id = 0; // Ensure ID is auto-generated
            _context.Sneakers.Add(sneaker);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetSneaker", new { id = sneaker.Id }, sneaker);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutSneaker(int id, Sneaker sneaker)
        {
            if (id != sneaker.Id) return BadRequest();
            _context.Entry(sneaker).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!SneakerExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSneaker(int id)
        {
            var sneaker = await _context.Sneakers.FindAsync(id);
            if (sneaker == null) return NotFound();
            _context.Sneakers.Remove(sneaker);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("instock")]
        public async Task<ActionResult<IEnumerable<Sneaker>>> GetInStockSneakers()
        {
            return await _context.Sneakers.Where(s => s.StockQuantity > 0).ToListAsync();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Sneaker>>> SearchSneakers(
            [FromQuery] string? brand = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int? minSize = null,
            [FromQuery] int? maxSize = null)
        {
            var query = _context.Sneakers.AsQueryable();

            if (!string.IsNullOrEmpty(brand))
                query = query.Where(s => s.Brand.Contains(brand));
            
            if (minPrice.HasValue)
                query = query.Where(s => s.Price >= minPrice.Value);
            
            if (maxPrice.HasValue)
                query = query.Where(s => s.Price <= maxPrice.Value);
            
            if (minSize.HasValue)
                query = query.Where(s => s.Size >= minSize.Value);
            
            if (maxSize.HasValue)
                query = query.Where(s => s.Size <= maxSize.Value);

            return await query.ToListAsync();
        }

        [HttpGet("report")]
        [Authorize]
        public async Task<ActionResult<object>> GetReport()
        {
            var totalSneakers = await _context.Sneakers.CountAsync();
            var totalValue = await _context.Sneakers.SumAsync(s => s.Price * s.StockQuantity);
            var averagePrice = await _context.Sneakers.AverageAsync(s => s.Price);
            
            return Ok(new
            {
                TotalSneakers = totalSneakers,
                TotalValue = totalValue,
                AveragePrice = averagePrice,
                InStock = await _context.Sneakers.CountAsync(s => s.StockQuantity > 0),
                OutOfStock = await _context.Sneakers.CountAsync(s => s.StockQuantity == 0),
                LimitedEdition = await _context.Sneakers.CountAsync(s => s.IsLimitedEdition),
                ReportDate = DateTime.Now
            });
        }

        [HttpGet("statistics")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetStatistics()
        {
            var brands = await _context.Sneakers
                .GroupBy(s => s.Brand)
                .Select(g => new
                {
                    Brand = g.Key,
                    Count = g.Count(),
                    AveragePrice = g.Average(s => s.Price),
                    TotalStock = g.Sum(s => s.StockQuantity)
                })
                .ToListAsync();

            return Ok(brands);
        }

        private bool SneakerExists(int id) => _context.Sneakers.Any(e => e.Id == id);
    }
}