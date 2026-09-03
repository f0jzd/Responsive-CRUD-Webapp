using System.Net;
using System.Net.Http.Json;
using Xunit;
using Quotes.Api;

namespace Quotes.Api.Tests;

/// <summary>
/// Integration tests for the public book catalog endpoints (Issue #1).
/// Verifies:
///   - Public endpoint access (no auth required)
///   - GET /api/books returns seeded catalog
///   - GET /api/books/{id} returns a single book or 404
///   - Response DTOs contain the fields needed for client-side search filtering
/// </summary>
public class BookEndpointsTests : IClassFixture<AppFactory>
{
    private readonly HttpClient _client;

    public BookEndpointsTests(AppFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── GET /api/books ─────────────────────────────────────────────────

    [Fact]
    public async Task GetBooks_Returns200_WithoutAuthentication()
    {
        // Act — no auth header attached
        var response = await _client.GetAsync("/api/books");

        // Assert — endpoint is publicly accessible
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetBooks_ReturnsSeededCatalog()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — the seed data in Program.cs creates 6 books
        Assert.NotNull(books);
        Assert.Equal(6, books.Count);
    }

    [Fact]
    public async Task GetBooks_ReturnsOrderedByCreatedAtDescending()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — should be newest first
        Assert.NotNull(books);
        for (int i = 0; i < books.Count - 1; i++)
        {
            Assert.True(books[i].CreatedAtUtc >= books[i + 1].CreatedAtUtc,
                $"Book at index {i} ({books[i].CreatedAtUtc:O}) should be >= book at index {i + 1} ({books[i + 1].CreatedAtUtc:O})");
        }
    }

    [Fact]
    public async Task GetBooks_EachBookContainsFieldsNeededForClientSideFiltering()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — every book must have non-empty title and author
        // so the frontend can filter by these fields
        Assert.NotNull(books);
        Assert.All(books, book =>
        {
            Assert.True(book.Id > 0, "Book should have a valid Id");
            Assert.False(string.IsNullOrWhiteSpace(book.Title), "Title must not be empty (needed for search filtering)");
            Assert.False(string.IsNullOrWhiteSpace(book.Author), "Author must not be empty (needed for search filtering)");
            Assert.False(string.IsNullOrWhiteSpace(book.PublicationDate), "PublicationDate must not be empty");
        });
    }

    [Fact]
    public async Task GetBooks_IncludesCreatorEmail()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — seed books are created by demo@example.com
        Assert.NotNull(books);
        Assert.All(books, book =>
        {
            Assert.Equal("demo@example.com", book.CreatorEmail);
        });
    }

    [Fact]
    public async Task GetBooks_ContainsExpectedSeedTitles()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — verify known seed data titles exist so client-side search has data
        Assert.NotNull(books);
        var titles = books.Select(b => b.Title).ToList();
        Assert.Contains("1984", titles);
        Assert.Contains("Kallocain", titles);
        Assert.Contains("Bröderna Lejonhjärta", titles);
    }

    [Fact]
    public async Task GetBooks_ContainsExpectedSeedAuthors()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — verify known authors exist so client-side author filtering works
        Assert.NotNull(books);
        var authors = books.Select(b => b.Author).ToHashSet();
        Assert.Contains("Astrid Lindgren", authors);
        Assert.Contains("George Orwell", authors);
        Assert.Contains("Karin Boye", authors);
    }

    // ─── GET /api/books/{id} ────────────────────────────────────────────

    [Fact]
    public async Task GetBookById_Returns200_WithoutAuthentication()
    {
        // Arrange — get a valid id from the catalog
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");
        Assert.NotNull(books);
        Assert.NotEmpty(books);
        var firstId = books[0].Id;

        // Act — no auth header
        var response = await _client.GetAsync($"/api/books/{firstId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetBookById_ReturnsCorrectBook()
    {
        // Arrange
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");
        Assert.NotNull(books);
        Assert.NotEmpty(books);
        var expected = books[0];

        // Act
        var book = await _client.GetFromJsonAsync<BookDto>($"/api/books/{expected.Id}");

        // Assert
        Assert.NotNull(book);
        Assert.Equal(expected.Id, book.Id);
        Assert.Equal(expected.Title, book.Title);
        Assert.Equal(expected.Author, book.Author);
        Assert.Equal(expected.PublicationDate, book.PublicationDate);
        Assert.Equal(expected.Description, book.Description);
        Assert.Equal(expected.CoverImageUrl, book.CoverImageUrl);
        Assert.Equal(expected.CreatorId, book.CreatorId);
        Assert.Equal(expected.CreatorEmail, book.CreatorEmail);
    }

    [Fact]
    public async Task GetBookById_Returns404_ForNonExistentId()
    {
        // Act
        var response = await _client.GetAsync("/api/books/99999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetBookById_Returns404_ForInvalidRoute()
    {
        // Act — non-integer id should not match the {id:int} route constraint
        var response = await _client.GetAsync("/api/books/abc");

        // Assert — should be 404 since the route won't match
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── Search filtering support ───────────────────────────────────────

    [Fact]
    public async Task GetBooks_ReturnsBooksFilterableByTitle_ClientSide()
    {
        // This test verifies the backend provides data that supports
        // the frontend's client-side title filtering

        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — simulate the client-side title filter
        Assert.NotNull(books);
        var searchTerm = "1984";
        var filtered = books.Where(b =>
            b.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

        Assert.Single(filtered);
        Assert.Equal("1984", filtered[0].Title);
        Assert.Equal("George Orwell", filtered[0].Author);
    }

    [Fact]
    public async Task GetBooks_ReturnsBooksFilterableByAuthor_ClientSide()
    {
        // This test verifies the backend provides data that supports
        // the frontend's client-side author filtering

        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — simulate client-side author filter for "Astrid Lindgren"
        Assert.NotNull(books);
        var searchTerm = "astrid lindgren";
        var filtered = books.Where(b =>
            b.Author.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

        // Seed has 2 Astrid Lindgren books: Bröderna Lejonhjärta & Mio, min Mio
        Assert.Equal(2, filtered.Count);
        Assert.All(filtered, b => Assert.Equal("Astrid Lindgren", b.Author));
    }

    [Fact]
    public async Task GetBooks_SearchWithNoMatch_ReturnsEmptyFilteredResults()
    {
        // This test verifies the empty-state scenario where a search term
        // matches no books in the catalog

        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — a nonsensical query should yield zero matches
        Assert.NotNull(books);
        var searchTerm = "zzzznonexistentzzzz";
        var filtered = books.Where(b =>
            b.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            b.Author.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

        Assert.Empty(filtered);
    }

    [Fact]
    public async Task GetBooks_SearchIsCaseInsensitive_ClientSide()
    {
        // Act
        var books = await _client.GetFromJsonAsync<List<BookDto>>("/api/books");

        // Assert — case-insensitive search for "GEORGE ORWELL" should find 1984
        Assert.NotNull(books);
        var searchTerm = "GEORGE ORWELL";
        var filtered = books.Where(b =>
            b.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            b.Author.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

        Assert.Single(filtered);
        Assert.Equal("1984", filtered[0].Title);
    }
}
