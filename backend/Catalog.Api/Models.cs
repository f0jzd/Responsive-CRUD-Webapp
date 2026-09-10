using System.ComponentModel.DataAnnotations;

namespace Catalog.Api;

public sealed class AppUser
{
    public int Id { get; set; }
    [MaxLength(200)] public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class Book
{
    public int Id { get; set; }
    [MaxLength(200)] public required string Title { get; set; }
    [MaxLength(100)] public required string Author { get; set; }
    [MaxLength(50)] public required string PublicationDate { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }
    [MaxLength(1000)] public string? CoverImageUrl { get; set; }
    public int CreatorId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class Quote
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    [MaxLength(1000)] public required string Text { get; set; }
    [MaxLength(200)] public string? Author { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public record Credentials(string Email, string Password);

public class BookInput
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? PublicationDate { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? CoverImageUrl { get; set; }
}

public record BookDto(
    int Id,
    string Title,
    string Author,
    string PublicationDate,
    string? Description,
    string? CoverImageUrl,
    int CreatorId,
    string? CreatorEmail,
    DateTime CreatedAtUtc
);

public class QuoteInput
{
    public string Text { get; set; } = string.Empty;
    public string? Author { get; set; }
}

