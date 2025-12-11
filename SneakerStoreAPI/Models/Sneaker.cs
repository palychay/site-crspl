using System.ComponentModel.DataAnnotations;

namespace SneakerStoreAPI.Models
{
    public class Sneaker
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string Brand { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string Model { get; set; } = string.Empty;

        [Range(35, 52)]
        public int Size { get; set; }

        public string Color { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        public DateTime ReleaseDate { get; set; }

        public bool IsLimitedEdition { get; set; }
    }
}