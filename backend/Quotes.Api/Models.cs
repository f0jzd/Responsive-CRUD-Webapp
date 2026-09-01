using System.ComponentModel.DataAnnotations;

namespace Quotes.Api;

public sealed class AppUser
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
}

public sealed class Quote
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    [MaxLength(1000)] public required string Text { get; set; }
    [MaxLength(200)] public string? Author { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public record Credentials([Required, EmailAddress] string Email, [Required, MinLength(8)] string Password);
public record QuoteInput([Required, MaxLength(1000)] string Text, [MaxLength(200)] string? Author);
