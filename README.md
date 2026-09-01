# Mina citat

En responsiv CRUD-applikation för personliga favoritcitat. Front-end är Angular 20 och back-end är ett ASP.NET Core 9 API med JWT-baserad autentisering.

## Förutsättningar

- .NET SDK 9
- Node.js LTS och Angular CLI 20 (`npm install -g @angular/cli@20`)

## Starta

```powershell
dotnet restore .\backend\Quotes.Api\Quotes.Api.csproj
dotnet run --project .\backend\Quotes.Api\Quotes.Api.csproj

cd frontend
npm install
npm start
```

API:t startar normalt på `http://localhost:5168`; justera `frontend/src/environments/environment.ts` om en annan port används.

> Byt JWT-nyckeln i `backend/Quotes.Api/appsettings.Development.json` innan appen används utanför lokal utveckling. I produktion ska den ligga i en secret store eller miljövariabel.

Se [docs/USER-STORIES.md](docs/USER-STORIES.md) för backlogg och acceptanskriterier.
