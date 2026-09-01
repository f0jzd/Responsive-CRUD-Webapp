using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quotes.Api;

var builder = WebApplication.CreateBuilder(args);
var jwt = builder.Configuration.GetSection("Jwt");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("quotes"));
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
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

string CreateToken(AppUser user)
{
    var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), new Claim(JwtRegisteredClaimNames.Email, user.Email) };
    var expiry = DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiryMinutes"] ?? "60"));
    return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims, expires: expiry, signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)));
}

app.MapPost("/api/auth/register", async (Credentials input, AppDbContext db) =>
{
    var email = input.Email.Trim().ToLowerInvariant();
    if (await db.Users.AnyAsync(u => u.Email == email)) return Results.Conflict(new { message = "E-postadressen används redan." });
    var user = new AppUser { Email = email, PasswordHash = new PasswordHasher<AppUser>().HashPassword(null!, input.Password) };
    db.Users.Add(user); await db.SaveChangesAsync();
    return Results.Ok(new { accessToken = CreateToken(user) });
});

app.MapPost("/api/auth/login", async (Credentials input, AppDbContext db) =>
{
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == input.Email.Trim().ToLowerInvariant());
    if (user is null || new PasswordHasher<AppUser>().VerifyHashedPassword(user, user.PasswordHash, input.Password) == PasswordVerificationResult.Failed)
        return Results.Unauthorized();
    return Results.Ok(new { accessToken = CreateToken(user) });
});

var quotes = app.MapGroup("/api/quotes").RequireAuthorization();
int UserId(ClaimsPrincipal user) => int.Parse(user.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
quotes.MapGet("/", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    return await db.Quotes
        .Where(q => q.OwnerId == userId)
        .OrderByDescending(q => q.CreatedAtUtc)
        .ToListAsync();
}); quotes.MapPost("/", async (QuoteInput input, ClaimsPrincipal user, AppDbContext db) => { var quote = new Quote { OwnerId = UserId(user), Text = input.Text, Author = input.Author }; db.Quotes.Add(quote); await db.SaveChangesAsync(); return Results.Created($"/api/quotes/{quote.Id}", quote); });
quotes.MapPut("/{id:int}", async (int id, QuoteInput input, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = UserId(user);
    var quote = await db.Quotes.SingleOrDefaultAsync(q => q.Id == id && q.OwnerId == userId);

    if (quote is null) return Results.NotFound();

    quote.Text = input.Text;
    quote.Author = input.Author;
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
