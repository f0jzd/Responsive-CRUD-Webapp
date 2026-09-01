# 01: SQLite DB and Public Book Catalog Browsing with Search

**What to build:** A public, searchable shared book catalog powered by SQLite storage. Visitors and Users can browse all registered books on a responsive card grid, filter them instantly by title or author in real time, see clean fallback book covers when no cover image is provided, and view informative empty states when no books match the search or the catalog is empty.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Backend persists data in a local SQLite database (`books.db`) using Entity Framework Core.
- [ ] Backend exposes public endpoints `GET /api/books` and `GET /api/books/{id}` accessible without authentication.
- [ ] Frontend displays a responsive grid of book cards showing title, author, description snippet, and cover image (with fallback placeholder).
- [ ] Real-time client-side search input filters books dynamically by title and author.
- [ ] Clean empty states are displayed when the catalog has 0 books or when search returns no matching results.
- [ ] Automated integration tests verify public endpoint access and search filtering behavior.
