using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SneakerStoreAPI.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        public string CustomerPhone { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public decimal TotalAmount { get; set; }

        // Убрали JsonIgnore для отображения OrderItems
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    public class CreateOrderRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public List<OrderItemRequest> OrderItems { get; set; } = new();
    }

    public class OrderItemRequest
    {
        public int SneakerId { get; set; }
        public int Quantity { get; set; }
        public int Size { get; set; }
    }
}