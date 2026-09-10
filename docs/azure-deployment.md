# Azure Deployment Guide

This guide walks you through deploying both the **Angular Frontend** and the **ASP.NET Core (.NET 9) Backend** to Microsoft Azure for free.

---

## Architecture

| Component | Azure Service | Tier | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** (`frontend/`) | **Azure Static Web Apps** | Free | Auto-builds via GitHub Actions, free SSL & CDN |
| **Backend** (`backend/Catalog.Api/`) | **Azure App Service (Linux)** | F1 Free | .NET 9 runtime, persistent `/home` disk for SQLite |

---

## Part 1: Deploy Backend (Azure App Service)

Deploy the backend first so you have its live URL.

### 1. Create App Service in Azure Portal
1. Open the [Azure Portal](https://portal.azure.com/).
2. Click **Create a resource** > **Web App**.
3. Fill in:
   - **Resource Group**: `rg-bookcatalog` (create new).
   - **Name**: e.g., `bookcatalog-api` (URL will be `https://bookcatalog-api.azurewebsites.net`).
   - **Publish**: `Code`.
   - **Runtime stack**: `.NET 9 (STS)`.
   - **Operating System**: `Linux`.
   - **Pricing Plan**: Select `Free F1`.
4. Click **Review + Create** > **Create**.

### 2. Enable Persistent Storage (for SQLite)
1. In your App Service, go to **Settings** > **Configuration** (or **Environment variables**).
2. Ensure `WEBSITES_ENABLE_APP_SERVICE_STORAGE` is set to `true`.
3. *(Optional)* Add a Connection String:
   - Name: `DefaultConnection`
   - Value: `Data Source=/home/books.db`
   - Type: `Custom`

### 3. Deploy Backend Code
From your local terminal:
```powershell
cd backend\Catalog.Api
dotnet publish -c Release -o ./publish
```
Then deploy via the **Azure Tools** VS Code extension (right click `publish` folder > *Deploy to Web App*) or via Azure CLI:
```powershell
az webapp deploy --resource-group rg-bookcatalog --name bookcatalog-api --src-path ./publish.zip --type zip
```

---

## Part 2: Deploy Frontend (Azure Static Web Apps)

### 1. Update Production API URL
In [frontend/src/environments/environment.prod.ts](file:///c:/Users/lolsx/Documents/AI_Basics_minispec_PRD/frontend/src/environments/environment.prod.ts):
```typescript
export const environment = {
  apiUrl: "https://<your-app-service-name>.azurewebsites.net/api"
};
```

### 2. Push Changes to GitHub
Commit and push your changes to your GitHub repository.

### 3. Create Static Web App in Azure Portal
1. In Azure Portal, search for **Static Web Apps** > **Create**.
2. Fill in:
   - **Resource Group**: `rg-bookcatalog`.
   - **Name**: `bookcatalog-frontend`.
   - **Plan type**: `Free`.
   - **Source**: `GitHub` (sign in and select your repository and `main` branch).
3. Under **Build Details**:
   - **Build Presets**: `Angular`
   - **App location**: `frontend`
   - **Api location**: *(leave blank)*
   - **Output location**: `dist/mina-citat-client/browser`
4. Click **Review + Create** > **Create**.

Azure will commit a GitHub Actions workflow into your repository and trigger the deployment.

---

## Part 3: Allow Frontend in Backend CORS

1. Copy your Azure Static Web App URL (e.g. `https://salmon-sea-01234.azurestaticapps.net`).
2. Go to your **App Service** in Azure Portal.
3. In the sidebar under **API**, click **CORS**.
4. Add your Static Web App URL to the allowed origins list and click **Save**.
