using Microsoft.EntityFrameworkCore;

namespace Quotes.Api;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Quote> Quotes => Set<Quote>();
}
