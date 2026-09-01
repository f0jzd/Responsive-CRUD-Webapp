# 05: Dedicated "My Books" Contributions View

**What to build:** A dedicated authenticated page (`/my-books`) protected by route guards, showing exclusively the books created by the currently logged-in User. Includes search filtering across personal contributions, inline Edit/Delete actions, and an empty state guiding users to contribute their first book.

**Blocked by:** 04 (Creator Edit and Delete with Confirmation Modal)

**Status:** ready-for-agent

- [ ] Frontend route `/my-books` is registered and guarded by `AuthGuard`.
- [ ] Navigation bar displays "My Books" link when logged in.
- [ ] View fetches or filters books where `CreatorId == currentUserId`.
- [ ] Search input enables filtering across personal contributions.
- [ ] Edit and Delete actions operate seamlessly within the Contributions view.
- [ ] Displays empty state with a call-to-action button to "Add your first book" when user has 0 contributions.
- [ ] Automated tests verify route guard protection and contributions filtering.
