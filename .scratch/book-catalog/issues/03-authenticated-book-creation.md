# 03: Authenticated Book Creation

**What to build:** Authenticated book creation functionality enabling registered Users to submit new books to the shared catalog. Includes backend validation, authentication checks, and a responsive frontend modal/form with live character validation and instant cover image preview. Submitting a new book immediately updates the shared catalog view.

**Blocked by:** 01 (SQLite DB and Public Book Catalog Browsing with Search)

**Status:** ready-for-agent

- [ ] Backend exposes authenticated endpoint `POST /api/books` requiring a valid JWT token.
- [ ] Backend validates required Title (1–200 chars), required Author (1–100 chars), optional Description (up to 2000 chars), and optional CoverImageUrl format.
- [ ] Submitted book is saved to SQLite with CreatorId set to the authenticated User's ID.
- [ ] Frontend displays an "Add Book" button in the navigation bar for authenticated users.
- [ ] Add Book modal provides form validation, field error messages, character counter, and instant cover image preview.
- [ ] Successful submission closes the modal, clears the form, and prepends the new book to the catalog list.
- [ ] Automated tests verify token requirement, validation errors, and successful book creation.
