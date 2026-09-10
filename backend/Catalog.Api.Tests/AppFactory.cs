using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Catalog.Api;
 
namespace Catalog.Api.Tests;

/// <summary>
/// Custom WebApplicationFactory that replaces the production SQLite database
/// with a shared in-memory SQLite database. The connection is kept open for the
/// lifetime of the factory so the in-memory DB persists across requests.
/// The seed data from Program.cs runs automatically because EnsureCreated() is
/// called on startup, giving every test the same baseline catalog.
/// </summary>
public class AppFactory : WebApplicationFactory<Program>
{
    // A single connection kept open so the in-memory DB survives across requests
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Open the connection before the host starts so the in-memory DB exists
        _connection.Open();

        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove the production DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null)
                services.Remove(descriptor);

            // Add in-memory SQLite using the shared open connection
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
            _connection.Dispose();
    }
}
