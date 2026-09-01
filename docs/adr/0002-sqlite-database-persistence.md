# 2. SQLite Database Persistence

## Context
The application needs to persist book records and user credentials across backend server restarts, while remaining straightforward to run locally without external infrastructure requirements.

## Decision
We chose SQLite with Entity Framework Core as the storage engine, storing data in a local file (`books.db`).

## Consequences
- Data persists across server restarts without requiring external database servers or Docker containers.
- Database schema can be migrated or recreated simply by managing the local SQLite file.
