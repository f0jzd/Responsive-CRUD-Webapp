# AGENTS.md

## Technology policy

- Use the latest stable Angular release, not preview/next/RC versions.
- Before changing dependencies, check current stable versions from official sources.
- For Angular, use `ng update` so Angular packages remain compatible.
- Keep all `@angular/*` packages on the same major version.
- Use the latest stable .NET SDK/LTS version required by this project.
- Prefer exact major versions for framework packages and allow compatible patch updates.
- After dependency changes, run the frontend build and backend build.
- Never upgrade major versions without reporting breaking changes first.

## Required checks

Frontend:
- `npm outdated`
- `npx ng update`
- `npm run build`

Backend:
- `dotnet --list-sdks`
- `dotnet list package --outdated`
- `dotnet build`