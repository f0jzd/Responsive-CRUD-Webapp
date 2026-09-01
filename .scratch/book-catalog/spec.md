# Spec: Shared Book Catalog

Status: ready-for-agent

## Problem Statement

Book lovers and casual readers lack a streamlined, accessible community hub where they can effortlessly discover new books without mandatory friction, while also having a reliable space to share their own recommendations and maintain the books they have personally contributed.

## Solution

A responsive web application featuring a unified, publicly accessible Book Catalog. Visitors can immediately search and explore books without logging in, with quick-view modal inspections for detailed reading. Registered Users can contribute new books, review their personal Contributions list, and exclusively edit or remove books they have registered, safeguarded by explicit deletion confirmations.

## User Stories

1. As a Visitor, I want to view the shared Catalog in a responsive card grid, so that I can discover books from both desktop and mobile devices.
2. As a Visitor, I want to search books by title or author in real time, so that I can quickly find specific books of interest without page reloads.
3. As a Visitor, I want to click any book card to open an Expandable Quick View modal, so that I can read the complete description and view metadata in full.
4. As a Visitor, I want to see clear, engaging empty states when no books match my search or when the Catalog is empty, so that I understand what is happening and how to proceed.
5. As a Visitor, I want to register a new User account with my email and password, so that I can contribute books to the community Catalog.
6. As a User, I want to log in securely to my account, so that I can access book creation and management features.
7. As a User, I want to see a navigation header indicating my authentication state and offering quick access to Catalog browsing, adding books, viewing my Contributions, and logging out.
8. As a User, I want to submit a new Book to the Catalog with a required Title (1–200 characters), required Author (1–100 characters), optional Description (up to 2000 characters), and an optional Cover Image URL, so that other readers can discover it.
9. As a User, I want the system to display a clean fallback placeholder cover image if I do not provide a Cover Image URL or if the image fails to load, so that all book cards maintain a polished visual layout.
10. As a User, I want form validation messages on the client and server if I submit missing or invalid required fields, so that I can correct errors immediately.
11. As a User, I want to see a distinct "Created by you" badge on cards for books I registered when browsing the main Catalog, so that I can easily identify my own submissions.
12. As a Creator, I want Edit and Delete action buttons to be visible and accessible on book cards and in the Quick View modal only for books I created, so that I can manage my entries.
13. As a User, I want the system to hide Edit and Delete controls on books created by other users, so that I do not attempt unauthorized changes.
14. As a User, I want to navigate to a dedicated "My Books" (Contributions) page, so that I can see and manage all the books I have submitted in one place.
15. As a Creator, I want to edit the title, author, description, or cover image URL of a book I registered, so that I can keep its details accurate.
16. As a Creator, I want an explicit Confirmation Modal to appear when I initiate book deletion, so that I do not accidentally delete my contribution from the shared Catalog.
17. As a Creator, I want the book to be removed from the shared Catalog upon confirming deletion, so that it is no longer visible to any visitor or user.
18. As a User, I want to log out at any time, returning my session to Visitor status with access restricted back to public browsing.

## Implementation Decisions

### Architectural Shape
- **Public Read, Authenticated Write**: Catalog browsing (`GET /api/books`) and single-book retrieval (`GET /api/books/{id}`) are publicly accessible without authentication headers.
- **Creator Ownership Enforcement**: Book creation (`POST /api/books`), editing (`PUT /api/books/{id}`), and deletion (`DELETE /api/books/{id}`) require a valid JWT token. Server-side authorization ensures only the matching Creator (`UserId == book.CreatorId`) can modify or delete a book. Unauthorized modification attempts return `404 Not Found` (to avoid leaking resource existence) or `403 Forbidden`.
- **Persistence**: Relational SQLite database (`books.db`) managed via Entity Framework Core with automatic schema creation on startup.
- **Permissive Uniqueness**: Multiple books with identical titles or authors are allowed and tracked via distinct primary keys and creator relationships.

### API Contracts
- `POST /api/auth/register`: `{ email, password }` -> `{ accessToken }`
- `POST /api/auth/login`: `{ email, password }` -> `{ accessToken }`
- `GET /api/books`: Returns list of all books in the Catalog ordered by newest first: `[{ id, title, author, description, coverImageUrl, creatorId, createdAtUtc }]`
- `GET /api/books/{id}`: Returns a single book entity or `404 Not Found`.
- `POST /api/books`: Requires Auth. Accepts `{ title, author, description?, coverImageUrl? }`. Returns `201 Created` with the newly created book.
- `PUT /api/books/{id}`: Requires Auth. Accepts `{ title, author, description?, coverImageUrl? }`. Updates the book if the authenticated user is the Creator, returning `204 NoContent` or `404 Not Found`.
- `DELETE /api/books/{id}`: Requires Auth. Deletes the book from the Catalog if the authenticated user is the Creator, returning `204 NoContent` or `404 Not Found`.

### Frontend Architecture
- **Catalog Component**: Displays search input, responsive card grid, empty state handler, and integrates the Quick View modal.
- **My Contributions Component**: Displays filtered list of books created by the currently logged-in user.
- **Book Form Component / Modal**: Handles both creation and editing with real-time validation and image preview.
- **Delete Confirmation Modal**: Reusable dialog prompting confirmation before executing deletion API calls.
- **Auth Guard & Interceptor**: Routes requiring authentication are protected; outgoing HTTP requests attach JWT tokens when available.

## Testing Decisions

### What Makes a Good Test
Tests must focus on observable external behavior and contracts rather than internal implementation mechanics:
- Test public read access vs authenticated write access.
- Test that creating a book persists it in the catalog and makes it searchable.
- Test that non-creators cannot edit or delete books registered by another user.
- Test that input validation rejects blank titles/authors and invalid lengths.
- Test UI search filtering behavior and modal opening/closing.

### Target Test Seams
1. **API / Backend Seam**: ASP.NET Core integration tests executing against HTTP endpoints with SQLite database persistence to verify end-to-end authentication, public reads, authorization rules, and CRUD lifecycle.
2. **Frontend UI Seam**: Angular component integration tests verifying card rendering, real-time search filtering, auth state transitions, and form validation triggers.

## Out of Scope
- External 3rd-party book API lookups (e.g. Google Books API or OpenLibrary auto-fetching).
- Book loaning, physical inventory tracking, or checkout systems.
- Multi-tier personal reading shelves (e.g. "Want to read", "Reading", "Read") - the platform is a unified Catalog with personal Contributions.
- User comments, reviews, or 5-star rating systems.
- Social following or direct messaging between users.

## Further Notes
- Respects [ADR 0001: Shared Global Catalog with Creator-Only Deletion](file:///docs/adr/0001-shared-catalog-with-creator-deletion.md).
- Respects [ADR 0002: SQLite Database Persistence](file:///docs/adr/0002-sqlite-database-persistence.md).
- Domain terminology strictly follows [`CONTEXT.md`](file:///CONTEXT.md).
