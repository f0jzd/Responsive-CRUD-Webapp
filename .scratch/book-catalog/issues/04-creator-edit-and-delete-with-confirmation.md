# 04: Creator Edit and Delete with Confirmation Modal

**What to build:** Creator-exclusive book management allowing Users to edit and delete only the books they registered. Cards in the catalog and Quick View modal display a "Created by you" badge and Edit/Delete action buttons exclusively for the Creator. Initiating deletion opens an explicit Confirmation Modal dialog. Non-creators cannot see edit/delete buttons, and any unauthorized backend mutation attempts are rejected.

**Blocked by:** 03 (Authenticated Book Creation)

**Status:** ready-for-agent

- [ ] Backend exposes authenticated endpoints `PUT /api/books/{id}` and `DELETE /api/books/{id}`.
- [ ] Backend authorization verifies `UserId == book.CreatorId`; rejects unauthorized attempts with `404 Not Found`.
- [ ] Frontend catalog cards and Quick View display "Created by you" badge for books registered by the logged-in User.
- [ ] Edit and Delete buttons are rendered exclusively on books owned by the logged-in User.
- [ ] Clicking Edit opens the book form pre-filled with existing data and updates the catalog upon save.
- [ ] Clicking Delete opens an explicit Confirmation Modal dialog (*"Are you sure you want to remove '[Title]' from the shared catalog? This action cannot be undone."*).
- [ ] Confirming deletion removes the book from the backend SQLite database and catalog UI.
- [ ] Automated tests verify Creator vs non-Creator authorization rules, edit updates, and deletion confirmation flows.
