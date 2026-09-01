# Book Catalog

A web platform for community book discovery, enabling users to explore a shared catalog and contribute books.

## Language

**Book**:
A published work registered in the shared catalog, defined by its title, author, description, and optional cover image URL.
_Avoid_: Item, post, entry, quote

**Catalog**:
The unified, publicly browsable collection of all books registered across the platform.
_Avoid_: Library, inventory, shelf, feed

**Contributions**:
The subset of books within the shared catalog registered by a specific user.
_Avoid_: My library, personal collection, favorites, saved books

**Creator**:
The authenticated user who added a specific book to the catalog and holds exclusive permission to delete or modify it.
_Avoid_: Owner, contributor, author (use "Creator" for the user and "Author" for the book's writer)

**User**:
An authenticated individual who can contribute new books to the catalog and manage the books they created.
_Avoid_: Member, account, customer

**Visitor**:
An unauthenticated individual who can browse and search the shared catalog without an account.
_Avoid_: Guest, anonymous user, public user
