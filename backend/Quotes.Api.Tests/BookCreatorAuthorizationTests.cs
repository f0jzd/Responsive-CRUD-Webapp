using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Quotes.Api;

namespace Quotes.Api.Tests;

public class BookCreatorAuthorizationTests : IClassFixture<AppFactory>
{
    private readonly HttpClient _client;

    public BookCreatorAuthorizationTests(AppFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetTokenAsync(string email, string password)
    {
        // Try login first
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new Credentials(email, password));
        if (loginResponse.IsSuccessStatusCode)
        {
            var body = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
            return body.GetProperty("accessToken").GetString()!;
        }

        // Otherwise register
        var regResponse = await _client.PostAsJsonAsync("/api/auth/register", new Credentials(email, password));
        regResponse.EnsureSuccessStatusCode();
        var regBody = await regResponse.Content.ReadFromJsonAsync<JsonElement>();
        return regBody.GetProperty("accessToken").GetString()!;
    }

    private async Task<BookDto> CreateBookAsAsync(string token, string title = "Creator Book")
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = title,
                Author = "Creator Author",
                PublicationDate = "2024-01-01"
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<BookDto>())!;
    }

    // ─── PUT /api/books/{id} Authorization ──────────────────────────────

    [Fact]
    public async Task PutBook_WithoutToken_Returns401Unauthorized()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var book = await CreateBookAsAsync(creatorToken, "Put Unauth Test");

        var response = await _client.PutAsJsonAsync($"/api/books/{book.Id}", new BookInput
        {
            Title = "Updated Title",
            Author = "Updated Author"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PutBook_ByNonCreator_Returns403Forbidden()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var otherUserToken = await GetTokenAsync("intruder@example.com", "Password123!");

        var book = await CreateBookAsAsync(creatorToken, "Owned by Demo");

        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/books/{book.Id}")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Hacked Title",
                Author = "Hacked Author"
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", otherUserToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PutBook_ByCreator_UpdatesBookAndReturns204NoContent()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var book = await CreateBookAsAsync(creatorToken, "Original Title");

        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/books/{book.Id}")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Modified By Creator",
                Author = "Creator Author",
                PublicationDate = "2025-01-01",
                Description = "Updated description"
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", creatorToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify changes are saved
        var getResponse = await _client.GetAsync($"/api/books/{book.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var updated = await getResponse.Content.ReadFromJsonAsync<BookDto>();
        Assert.NotNull(updated);
        Assert.Equal("Modified By Creator", updated.Title);
        Assert.Equal("Updated description", updated.Description);
    }

    // ─── DELETE /api/books/{id} Authorization ───────────────────────────

    [Fact]
    public async Task DeleteBook_WithoutToken_Returns401Unauthorized()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var book = await CreateBookAsAsync(creatorToken, "Delete Unauth Test");

        var response = await _client.DeleteAsync($"/api/books/{book.Id}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBook_ByNonCreator_Returns403Forbidden()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var otherUserToken = await GetTokenAsync("attacker@example.com", "Password123!");

        var book = await CreateBookAsAsync(creatorToken, "Demo Owned Book");

        var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/books/{book.Id}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", otherUserToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBook_ByCreator_RemovesBookAndReturns204NoContent()
    {
        var creatorToken = await GetTokenAsync("demo@example.com", "Password123!");
        var book = await CreateBookAsAsync(creatorToken, "Book To Delete");

        var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/books/{book.Id}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", creatorToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Subsequent GET returns 404
        var getResponse = await _client.GetAsync($"/api/books/{book.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    // ─── GET /api/books/mine (User Contributions) ────────────────────────

    [Fact]
    public async Task GetMyBooks_WithoutToken_Returns401Unauthorized()
    {
        var response = await _client.GetAsync("/api/books/mine");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyBooks_ReturnsOnlyBooksCreatedByCurrentUser()
    {
        var userToken = await GetTokenAsync("contributor@example.com", "Password123!");
        var book1 = await CreateBookAsAsync(userToken, "Contributor Book 1");
        var book2 = await CreateBookAsAsync(userToken, "Contributor Book 2");

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/books/mine");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var myBooks = await response.Content.ReadFromJsonAsync<List<BookDto>>();
        Assert.NotNull(myBooks);
        Assert.True(myBooks.Count >= 2);
        Assert.All(myBooks, b => Assert.Equal("contributor@example.com", b.CreatorEmail));
        Assert.Contains(myBooks, b => b.Id == book1.Id);
        Assert.Contains(myBooks, b => b.Id == book2.Id);
    }

    [Fact]
    public async Task GetMyBooks_WhenUserHasNoBooks_ReturnsEmptyList()
    {
        var emptyUserToken = await GetTokenAsync("nobooks@example.com", "Password123!");

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/books/mine");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", emptyUserToken);

        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var myBooks = await response.Content.ReadFromJsonAsync<List<BookDto>>();
        Assert.NotNull(myBooks);
        Assert.Empty(myBooks);
    }
}
