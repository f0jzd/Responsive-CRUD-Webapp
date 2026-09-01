# 1. Shared Global Catalog with Creator-Only Deletion

## Context
The platform allows users to browse, add, and remove books. We needed to decide whether books exist in isolated private user libraries or in a single unified catalog, and what deletion semantics apply.

## Decision
We chose a shared global catalog accessible to all users for browsing and searching. Any authenticated user can contribute a new book to the catalog, but deletion is restricted exclusively to the specific user (Creator) who registered that book.

## Consequences
- All users share a single global list of books rather than disjoint personal collections.
- Deletion removes the book from the global catalog entirely, so authorization must enforce that only the original Creator can execute delete operations.
