using Microsoft.EntityFrameworkCore;

namespace Quotes.Api;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();
}
