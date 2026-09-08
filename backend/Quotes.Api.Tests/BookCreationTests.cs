using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Quotes.Api;

namespace Quotes.Api.Tests;

public class BookCreationTests : IClassFixture<AppFactory>
{
    private readonly HttpClient _client;

    public BookCreationTests(AppFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetAccessTokenAsync(string email = "demo@example.com", string password = "Password123!")
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new Credentials(email, password));
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("accessToken").GetString()!;
    }

    // ─── Authentication requirement tests ───────────────────────────────

    [Fact]
    public async Task PostBook_WithoutToken_Returns401Unauthorized()
    {
        var payload = new BookInput
        {
            Title = "Test Book",
            Author = "Test Author"
        };

        var response = await _client.PostAsJsonAsync("/api/books", payload);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PostBook_WithInvalidToken_Returns401Unauthorized()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput { Title = "Test Book", Author = "Test Author" })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "invalid-token-string");

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── Validation tests ───────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task PostBook_WithEmptyOrMissingTitle_Returns400BadRequest(string? title)
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = title!,
                Author = "Valid Author"
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostBook_WithTitleExceeding200Chars_Returns400BadRequest()
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = new string('A', 201),
                Author = "Valid Author"
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task PostBook_WithEmptyOrMissingAuthor_Returns400BadRequest(string? author)
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Valid Title",
                Author = author!
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostBook_WithAuthorExceeding100Chars_Returns400BadRequest()
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Valid Title",
                Author = new string('B', 101)
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostBook_WithDescriptionExceeding2000Chars_Returns400BadRequest()
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Valid Title",
                Author = "Valid Author",
                Description = new string('C', 2001)
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostBook_WithCoverImageUrlExceeding1000Chars_Returns400BadRequest()
    {
        var token = await GetAccessTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(new BookInput
            {
                Title = "Valid Title",
                Author = "Valid Author",
                CoverImageUrl = "https://example.com/" + new string('d', 1000)
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─── Successful creation & CreatorId linking ─────────────────────────

    [Fact]
    public async Task PostBook_WithValidInput_Returns201AndCreatesBookLinkedToCreator()
    {
        var token = await GetAccessTokenAsync("demo@example.com", "Password123!");
        var payload = new BookInput
        {
            Title = "The Pragmatic Programmer",
            Author = "Andy Hunt & Dave Thomas",
            PublicationDate = "1999-10-30",
            Description = "From journeyman to master.",
            CoverImageUrl = "https://example.com/pragmatic.jpg"
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<BookDto>();
        Assert.NotNull(created);
        Assert.True(created.Id > 0);
        Assert.Equal(payload.Title, created.Title);
        Assert.Equal(payload.Author, created.Author);
        Assert.Equal(payload.PublicationDate, created.PublicationDate);
        Assert.Equal(payload.Description, created.Description);
        Assert.Equal(payload.CoverImageUrl, created.CoverImageUrl);
        Assert.Equal("demo@example.com", created.CreatorEmail);
        Assert.True(created.CreatorId > 0);

        // Verify book can be retrieved via GET /api/books/{id}
        var getResponse = await _client.GetAsync($"/api/books/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<BookDto>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(created.CreatorId, fetched.CreatorId);
    }

    [Fact]
    public async Task PostBook_WithoutPublicationDate_DefaultsToCurrentDate()
    {
        var token = await GetAccessTokenAsync("demo@example.com", "Password123!");
        var payload = new BookInput
        {
            Title = "Refactoring",
            Author = "Martin Fowler"
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/books")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<BookDto>();
        Assert.NotNull(created);
        Assert.False(string.IsNullOrWhiteSpace(created.PublicationDate));
        Assert.Equal(DateTime.UtcNow.ToString("yyyy-MM-dd"), created.PublicationDate);
    }
}
