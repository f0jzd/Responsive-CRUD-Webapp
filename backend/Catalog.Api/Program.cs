using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Catalog.Api;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
var jwt = builder.Configuration.GetSection("Jwt");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "books.db");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:4200")
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwt["Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        var hasher = new PasswordHasher<AppUser>();
        var demoUser = new AppUser
        {
            Email = "demo@example.com",
            PasswordHash = hasher.HashPassword(null!, "Password123!")
        };
        db.Users.Add(demoUser);
        db.SaveChanges();

        SeedDefaultQuotes(db, demoUser.Id);

        db.Books.AddRange(
            new Book
            {
                Title = "Bröderna Lejonhjärta",
                Author = "Astrid Lindgren",
                PublicationDate = "1973-10-01",
                Description = "En tidlös berättelse om bröderna Skorpan och Jonatan och deras kamp mot tyrannen Tengil i Nangijala.",
                CoverImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            },
            new Book
            {
                Title = "1984",
                Author = "George Orwell",
                PublicationDate = "1949-06-08",
                Description = "En dystopisk roman om övervakning, sanning och individens frihet under Storebrors vakande öga.",
                CoverImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            },
            new Book
            {
                Title = "Mio, min Mio",
                Author = "Astrid Lindgren",
                PublicationDate = "1954-05-15",
                Description = "Berättelsen om pojken Bosse som reser till Landet i Fjärran och möter riddar Kato.",
                CoverImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            },
            new Book
            {
                Title = "Sapiens: En kort historik över mänskligheten",
                Author = "Yuval Noah Harari",
                PublicationDate = "2011-01-01",
                Description = "En banbrytande genomgång av hur Homo sapiens blev jordens härskare från förhistoria till nutid.",
                CoverImageUrl = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            },
            new Book
            {
                Title = "Den store Gatsby",
                Author = "F. Scott Fitzgerald",
                PublicationDate = "1925-04-10",
                Description = "En skildring av 1920-talets jazzålder, rikedom, drömmar och olycklig kärlek på Long Island.",
                CoverImageUrl = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            },
            new Book
            {
                Title = "Kallocain",
                Author = "Karin Boye",
                PublicationDate = "1940-10-01",
                Description = "En klassisk svensk dystopi om ett totalitärt kontrollsamhälle och ett sanningsserum som avslöjar människors innersta tankar.",
                CoverImageUrl = "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80",
                CreatorId = demoUser.Id
            }
        );
        db.SaveChanges();
    }
}

static void SeedDefaultQuotes(AppDbContext db, int userId)
{
    db.Quotes.AddRange(
        new Quote { OwnerId = userId, Text = "Allt stort som skedde i världen skedde först i någon människas fantasi.", Author = "Astrid Lindgren" },
        new Quote { OwnerId = userId, Text = "Det är inte för att saker är svåra som vi inte vågar, det är för att vi inte vågar som de är svåra.", Author = "Seneca" },
        new Quote { OwnerId = userId, Text = "Fantasi är viktigare än kunskap. För kunskap är begränsad, medan fantasin rymmer hela världen.", Author = "Albert Einstein" },
        new Quote { OwnerId = userId, Text = "Den som inte gör några misstag provar aldrig något nytt.", Author = "Albert Einstein" },
        new Quote { OwnerId = userId, Text = "Mod är inte avsaknad av rädsla, utan triumfen över den.", Author = "Nelson Mandela" }
    );
}

string CreateToken(AppUser user)
{
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email)
    };
    var expiry = DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiryMinutes"] ?? "60"));
    return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
        jwt["Issuer"],
        jwt["Audience"],
        claims,
        expires: expiry,
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
    ));
}

int UserId(ClaimsPrincipal user)
{
    var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
           ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? user.FindFirstValue("sub");

    if (int.TryParse(sub, out var id))
    {
        return id;
    }
    throw new InvalidOperationException($"Invalid or missing user id claim: '{sub}'");
}

// --- Auth Endpoints ---
app.MapPost("/api/auth/register", async (Credentials input, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.Password) || input.Password.Length < 6)
    {
        return Results.BadRequest(new { message = "Giltig e-post och lösenord med minst 6 tecken krävs." });
    }

    var email = input.Email.Trim().ToLowerInvariant();
    if (await db.Users.AnyAsync(u => u.Email == email))
    {
        return Results.Conflict(new { message = "E-postadressen används redan." });
    }

    var user = new AppUser
    {
        Email = email,
        PasswordHash = new PasswordHasher<AppUser>().HashPassword(null!, input.Password)
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    SeedDefaultQuotes(db, user.Id);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        accessToken = CreateToken(user),
        user = new { id = user.Id, email = user.Email }
    });
});

app.MapPost("/api/auth/login", async (Credentials input, AppDbContext db) =>
{
    var email = input.Email.Trim().ToLowerInvariant();
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email);
    if (user is null || new PasswordHasher<AppUser>().VerifyHashedPassword(user, user.PasswordHash, input.Password) == PasswordVerificationResult.Failed)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        accessToken = CreateToken(user),
        user = new { id = user.Id, email = user.Email }
    });
});

app.MapGet("/api/auth/me", (ClaimsPrincipal user, AppDbContext db) =>
{
    var id = UserId(user);
    var email = user.FindFirstValue(JwtRegisteredClaimNames.Email) ?? user.FindFirstValue(ClaimTypes.Email);
    return Results.Ok(new { id, email });
}).RequireAuthorization();

// --- Books Endpoints ---
var books = app.MapGroup("/api/books");

books.MapGet("/", async (AppDbContext db) =>
{
    var list = await (from b in db.Books
                      join u in db.Users on b.CreatorId equals u.Id into userGroup
                      from u in userGroup.DefaultIfEmpty()
                      orderby b.CreatedAtUtc descending
                      select new BookDto(
                          b.Id,
                          b.Title,
                          b.Author,
                          b.PublicationDate,
                          b.Description,
                          b.CoverImageUrl,
                          b.CreatorId,
                          u != null ? u.Email : null,
                          b.CreatedAtUtc
                      )).ToListAsync();

    return Results.Ok(list);
});

books.MapGet("/mine", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    var list = await (from b in db.Books
                      where b.CreatorId == userId
                      join u in db.Users on b.CreatorId equals u.Id into userGroup
                      from u in userGroup.DefaultIfEmpty()
                      orderby b.CreatedAtUtc descending
                      select new BookDto(
                          b.Id,
                          b.Title,
                          b.Author,
                          b.PublicationDate,
                          b.Description,
                          b.CoverImageUrl,
                          b.CreatorId,
                          u != null ? u.Email : null,
                          b.CreatedAtUtc
                      )).ToListAsync();

    return Results.Ok(list);
}).RequireAuthorization();

books.MapGet("/{id:int}", async (int id, AppDbContext db) =>
{
    var book = await (from b in db.Books
                      where b.Id == id
                      join u in db.Users on b.CreatorId equals u.Id into userGroup
                      from u in userGroup.DefaultIfEmpty()
                      select new BookDto(
                          b.Id,
                          b.Title,
                          b.Author,
                          b.PublicationDate,
                          b.Description,
                          b.CoverImageUrl,
                          b.CreatorId,
                          u != null ? u.Email : null,
                          b.CreatedAtUtc
                      )).SingleOrDefaultAsync();

    return book is not null ? Results.Ok(book) : Results.NotFound();
});

books.MapPost("/", async (BookInput input, ClaimsPrincipal user, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Trim().Length > 200)
    {
        return Results.BadRequest(new { message = "Titel är obligatorisk och får vara högst 200 tecken." });
    }
    if (string.IsNullOrWhiteSpace(input.Author) || input.Author.Trim().Length > 100)
    {
        return Results.BadRequest(new { message = "Författare är obligatorisk och får vara högst 100 tecken." });
    }
    if (!string.IsNullOrWhiteSpace(input.Description) && input.Description.Trim().Length > 2000)
    {
        return Results.BadRequest(new { message = "Beskrivning får vara högst 2000 tecken." });
    }
    if (!string.IsNullOrWhiteSpace(input.CoverImageUrl) && input.CoverImageUrl.Trim().Length > 1000)
    {
        return Results.BadRequest(new { message = "Omslagsbildens URL får vara högst 1000 tecken." });
    }

    var publicationDate = string.IsNullOrWhiteSpace(input.PublicationDate)
        ? DateTime.UtcNow.ToString("yyyy-MM-dd")
        : input.PublicationDate.Trim();

    var userId = UserId(user);
    var book = new Book
    {
        Title = input.Title.Trim(),
        Author = input.Author.Trim(),
        PublicationDate = publicationDate,
        Description = string.IsNullOrWhiteSpace(input.Description) ? null : input.Description.Trim(),
        CoverImageUrl = string.IsNullOrWhiteSpace(input.CoverImageUrl) ? null : input.CoverImageUrl.Trim(),
        CreatorId = userId
    };

    db.Books.Add(book);
    await db.SaveChangesAsync();

    var creator = await db.Users.FindAsync(userId);
    var dto = new BookDto(
        book.Id,
        book.Title,
        book.Author,
        book.PublicationDate,
        book.Description,
        book.CoverImageUrl,
        book.CreatorId,
        creator?.Email,
        book.CreatedAtUtc
    );

    return Results.Created($"/api/books/{book.Id}", dto);
}).RequireAuthorization();

books.MapPut("/{id:int}", async (int id, BookInput input, ClaimsPrincipal user, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Trim().Length > 200)
    {
        return Results.BadRequest(new { message = "Titel är obligatorisk och får vara högst 200 tecken." });
    }
    if (string.IsNullOrWhiteSpace(input.Author) || input.Author.Trim().Length > 100)
    {
        return Results.BadRequest(new { message = "Författare är obligatorisk och får vara högst 100 tecken." });
    }
    if (!string.IsNullOrWhiteSpace(input.Description) && input.Description.Trim().Length > 2000)
    {
        return Results.BadRequest(new { message = "Beskrivning får vara högst 2000 tecken." });
    }
    if (!string.IsNullOrWhiteSpace(input.CoverImageUrl) && input.CoverImageUrl.Trim().Length > 1000)
    {
        return Results.BadRequest(new { message = "Omslagsbildens URL får vara högst 1000 tecken." });
    }

    var userId = UserId(user);
    var book = await db.Books.SingleOrDefaultAsync(b => b.Id == id);
    if (book is null) return Results.NotFound();
    if (book.CreatorId != userId) return Results.Forbid();

    var publicationDate = string.IsNullOrWhiteSpace(input.PublicationDate)
        ? book.PublicationDate
        : input.PublicationDate.Trim();

    book.Title = input.Title.Trim();
    book.Author = input.Author.Trim();
    book.PublicationDate = publicationDate;
    book.Description = string.IsNullOrWhiteSpace(input.Description) ? null : input.Description.Trim();
    book.CoverImageUrl = string.IsNullOrWhiteSpace(input.CoverImageUrl) ? null : input.CoverImageUrl.Trim();

    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

books.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    var book = await db.Books.SingleOrDefaultAsync(b => b.Id == id);
    if (book is null) return Results.NotFound();
    if (book.CreatorId != userId) return Results.Forbid();

    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// --- Quotes Endpoints ---
var quotes = app.MapGroup("/api/quotes").RequireAuthorization();

quotes.MapGet("/", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    return await db.Quotes
        .Where(q => q.OwnerId == userId)
        .OrderByDescending(q => q.CreatedAtUtc)
        .ToListAsync();
});

quotes.MapPost("/", async (QuoteInput input, ClaimsPrincipal user, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Text))
    {
        return Results.BadRequest(new { message = "Citattext är obligatorisk." });
    }

    var quote = new Quote
    {
        OwnerId = UserId(user),
        Text = input.Text.Trim(),
        Author = string.IsNullOrWhiteSpace(input.Author) ? null : input.Author.Trim()
    };
    db.Quotes.Add(quote);
    await db.SaveChangesAsync();
    return Results.Created($"/api/quotes/{quote.Id}", quote);
});

quotes.MapPut("/{id:int}", async (int id, QuoteInput input, ClaimsPrincipal user, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Text))
    {
        return Results.BadRequest(new { message = "Citattext är obligatorisk." });
    }

    var userId = UserId(user);
    var quote = await db.Quotes.SingleOrDefaultAsync(q => q.Id == id && q.OwnerId == userId);
    if (quote is null) return Results.NotFound();

    quote.Text = input.Text.Trim();
    quote.Author = string.IsNullOrWhiteSpace(input.Author) ? null : input.Author.Trim();
    await db.SaveChangesAsync();

    return Results.NoContent();
});

quotes.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    var quote = await db.Quotes.SingleOrDefaultAsync(q => q.Id == id && q.OwnerId == userId);
    if (quote is null) return Results.NotFound();

    db.Quotes.Remove(quote);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

// Make the implicit Program class accessible for WebApplicationFactory in integration tests
public partial class Program { }
