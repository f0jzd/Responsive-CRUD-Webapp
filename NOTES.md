# Teaching Notes & User Preferences

## Learner Profile
- **Prior Experience**: Zero prior background with backend engineering (.NET, C#, databases) and frontend frameworks (Angular, TypeScript).
- **Stated Objective**: Understand "how it all works" starting from Issue #1 (SQLite DB, public book catalog API, and Angular frontend with real-time search).
- **Pedagogical Needs**:
  - Keep cognitive load minimal.
  - Rely on visual mental models and intuitive analogies before presenting code.
  - Break Issue #1 into logical layers:
    1. The Big Picture (Client ↔ Server ↔ Database loop)
    2. The Storage Layer (SQLite file + EF Core DbContext)
    3. The API Layer (ASP.NET Core Minimal API endpoints & HTTP responses)
    4. The Frontend Layer (Angular component, template card grid, and signals)
    5. The Interactive Feature (Real-time search filtering & empty states)
    6. Testing (Automated verification)
  - Interactive browser-based lessons with instant feedback quizzes for retrieval practice.
