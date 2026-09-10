# Bokkatalog & Mina citat

En fullstack och fullt responsiv webbapplikation med en delad bokkatalog och personliga favoritcitat.
- **Front-end**: Angular 20, Bootstrap 5.3 och Font Awesome 6.
- **Back-end**: ASP.NET Core 9 Web API i C# med SQLite EF Core-persistens och JWT-autentisering.

## Funktioner

- 📚 **Bokkatalog (Startsida)**:
  - Responsiv kortvy med omslag, titel, författare, publiceringsdatum och beskrivning.
  - Realtidssökning och filtrering.
  - Lägg till ny bok via ett dedikerat formulär (`/books/new`).
  - Redigera och radera böcker (`Creator`-skyddat: endast den som skapade boken kan redigera/radera den).
- 💬 **Mina citat (`/mina-citat`)**:
  - Skyddad vy för inloggade användare med 5 favoritcitat seedade från start.
  - Lägg till, redigera och ta bort personliga citat med realtidsteckenräknare.
- 🔐 **Autentisering & Säkerhet**:
  - Registrera konto och logga in med JWT-token.
  - Automatisk HTTP-interceptor som bifogar `Bearer <token>` på API-anrop.
  - Angular `AuthGuard` som skyddar formulär och citatsidan.
  - Demo-konto förkonfigurerat: `demo@example.com` / `Password123!`.

## Förutsättningar

- .NET SDK 9
- Node.js LTS (v20+) och npm

## Starta applikationen

### 1. Starta backend API (.NET 9)
```powershell
dotnet restore .\backend\Catalog.Api\Catalog.Api.csproj
dotnet run --project .\backend\Catalog.Api\Catalog.Api.csproj --urls "http://localhost:5168"
```

### 2. Starta frontend (Angular 20)
```powershell
cd frontend
npm install
npm start
```

Öppna webbläsaren på `http://localhost:4200`.

## Tester

Kör automatiserade enhets- och integrationstester:
```powershell
# Backend (38 xUnit-tester)
dotnet test .\backend\Catalog.Api.Tests\Catalog.Api.Tests.csproj

# Frontend (30 Jest-tester)
cd frontend
npm test
```

Interaktiva API-tester kan köras mot en aktiv backend via:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test_api.ps1
```

