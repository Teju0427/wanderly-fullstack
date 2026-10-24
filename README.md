# Wanderly

**Discover places worth remembering.**

Wanderly is a full-stack travel discovery app: a React 19 frontend, a Node.js/Express REST API, and an **Azure SQL Database**. The catalog (destinations, experiences, stays) is served from SQL, and each visitor's wishlist, trip plan, contact messages and newsletter sign-ups are stored there too. Frontend and API ship together as **one Azure App Service**.

## 🌐 Live demo

**[wanderly-teju-befehjcsakc3c3cu.centralindia-01.azurewebsites.net](https://wanderly-teju-befehjcsakc3c3cu.centralindia-01.azurewebsites.net)**

API health check: [/api/health](https://wanderly-teju-befehjcsakc3c3cu.centralindia-01.azurewebsites.net/api/health)

> Hosted on Azure free tiers. The first visit after a quiet period can take 30–60 seconds while the app and database wake up.

![Deploy to Azure App Service](https://github.com/Teju0427/wanderly-fullstack/actions/workflows/azure-webapp.yml/badge.svg)

## Team

The work was split equally: each member owned part of the frontend, part of the backend, and one piece of the cloud setup.

| Area | MK Tejaswini ([@Teju0427](https://github.com/Teju0427)) | Manya RI |
|---|---|---|
| **Frontend** | Trip Planner with cloud auto-save, Contact and Newsletter forms, API client (`src/lib/api.js`) | Home, Explore and Destination pages, catalog and wishlist state (`CatalogContext`, `WishlistContext`), offline fallback |
| **Backend** | Express server setup, API validation and request checks (visitor-ID header check, input validation, rate limiting, error handling), trip and contact endpoints | Catalog, wishlist and newsletter endpoints, catalog loading and caching |
| **Database / Cloud** | Azure deployment: App Service, environment configuration, GitHub Actions CI/CD | Azure SQL Database: schema design (15 tables), constraints, seed data |
| **Testing** | Live deployment testing (health check, trip and contact flows) | Data verification in the Azure Query editor (catalog, wishlist rows) |

B.Tech, Artificial Intelligence and Data Science, REVA University, Bengaluru.

## Features

- **Home**: hero with search, trending destinations, popular experiences, featured stays, travel inspiration, testimonials.
- **Explore**: live search, category, price and rating filters, and sort.
- **Destination detail**: gallery, budget and best-time sidebar, things to do, related experiences and stays, tips.
- **Trip Planner**: pick a destination and trip length and add experiences day by day, with a running budget. **Auto-saves to Azure SQL** (debounced) with a live "Saved to the cloud" indicator.
- **Wishlist**: heart anything. Saved to Azure SQL per visitor.
- **Contact**: validated on the client and the server, and stored in `ContactMessages`.
- **Newsletter**: footer sign-up stored in `NewsletterSubscribers` (duplicate-safe).
- **Graceful offline mode**: if the API or database is unreachable, the UI falls back to the bundled catalog and `localStorage`, so the site never breaks.
- Dark/light mode, mobile navigation, toasts, scroll-reveal and page-transition animation.

## Architecture

```
Browser (React + Vite build)
   │  fetch /api/*   (X-Visitor-Id: anonymous UUID per browser)
   ▼
Azure App Service (Linux, Node 22)
   └─ Express  ── serves dist/ (SPA) + REST API under /api
         │  mssql (TLS, pooled)
         ▼
Azure SQL Database
```

There are no user accounts. Each browser gets an anonymous UUID (stored in `localStorage`) that keys its wishlist and trip. That keeps the app simple and private, while still putting the data on the server.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion, React Router v7, lucide-react |
| Backend | Node.js 20+, Express 5, `mssql` (Tedious driver) |
| Database | Azure SQL Database (T-SQL), normalized schema with FKs, CHECK constraints and indexes |
| Hosting / CI | Azure App Service (Linux) + GitHub Actions |

## Database schema

`server/sql/schema.sql` is idempotent: it is safe to run repeatedly.

| Table | Purpose |
|---|---|
| `Destinations`, `Experiences`, `Stays` | Catalog |
| `DestinationGallery`, `DestinationThingsToDo`, `DestinationTips`, `StayAmenities` | Ordered child lists (1-to-many) |
| `DestinationExperiences`, `DestinationStays` | Many-to-many links |
| `Visitors` | Anonymous visitor ids |
| `WishlistItems` | Visitor ↔ saved item (`destination` / `experience` / `stay`) |
| `Trips`, `TripActivities` | One trip per visitor; activities per day, ordered by position |
| `ContactMessages`, `NewsletterSubscribers` | Inbound forms |

The catalog seed is generated from `src/data/*.js`, so the frontend's fallback data and the database never drift apart. `server/sql/seed.sql` is the same seed as plain SQL, for running by hand.

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | App + DB status |
| GET | `/api/catalog` | Destinations, experiences and stays in one call |
| GET | `/api/destinations?q=&category=&maxPrice=&minRating=` | Filtered destinations |
| GET | `/api/destinations/:id` | One destination |
| GET | `/api/experiences`, `/api/stays` | Lists |
| GET / POST / DELETE | `/api/wishlist`, `/api/wishlist/:itemId` | Visitor wishlist (needs `X-Visitor-Id`) |
| GET / PUT / DELETE | `/api/trip` | Visitor trip plan (transactional save) |
| POST | `/api/contact` | Contact form (rate-limited) |
| POST | `/api/newsletter` | Newsletter sign-up (rate-limited) |

All queries are parameterized. The API returns `503` when the database is unavailable, and the frontend handles this by falling back to offline mode.

## Run locally

```bash
npm install
cp .env.example .env        # fill in your Azure SQL details (see below)

# terminal 1: API on :8080 (creates tables + seeds on first start)
npm run dev:server

# terminal 2: Vite on :5173, proxies /api to :8080
npm run dev
```

Production-style run (one process, as on Azure):

```bash
npm run build && npm start    # http://localhost:8080
```

For local development you can point `.env` at your Azure SQL database (add your IP in the server's firewall), or at a local SQL Server in Docker:

```bash
docker run -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Your_strong_pw1' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
# .env: DB_SERVER=localhost, DB_USER=sa, DB_PASSWORD=Your_strong_pw1,
#       DB_NAME=master, DB_TRUST_SERVER_CERTIFICATE=true
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:server` | Express API with auto-reload |
| `npm run build` | Build the frontend to `dist/` |
| `npm start` | Serve `dist/` + API (what Azure runs) |
| `npm run db:migrate` | Create/upgrade tables and seed the catalog |
| `npm run db:seed-sql` | Regenerate `server/sql/seed.sql` from `src/data` |

## Deploy to Azure

### 1. Create the Azure SQL Database

1. Azure Portal → **Create a resource → SQL Database**.
2. Create a new **server** (e.g. `wanderly-sql`) with **SQL authentication**. Note the admin login and password.
3. Database name: `wanderly`. For a student or free setup, choose **"Apply offer" (free Azure SQL Database)** or *Serverless, General Purpose* with auto-pause.
4. **Networking**: turn on **"Allow Azure services and resources to access this server"**, and add your client IP if you want to connect from your laptop.

### 2. Create the Web App

1. **Create a resource → Web App**. Publish: **Code**. Runtime: **Node 22 LTS**. OS: **Linux**. Plan: Free F1 or Basic B1.
2. Web App → **Settings → Environment variables**, add:

   | Name | Value |
   |---|---|
   | `DB_SERVER` | `wanderly-sql.database.windows.net` |
   | `DB_NAME` | `wanderly` |
   | `DB_USER` | your SQL admin login |
   | `DB_PASSWORD` | your SQL admin password |
   | `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` (GitHub Actions already builds) |

3. **Configuration → General settings → Startup command**: `npm start` (App Service usually detects this on its own).

On first boot the server creates all tables and seeds the catalog (`DB_AUTO_MIGRATE=true` by default). If you'd rather do it by hand, open **SQL Database → Query editor**, then run `server/sql/schema.sql` followed by `server/sql/seed.sql`, and set `DB_AUTO_MIGRATE=false`.

### 3. Deploy with GitHub Actions

1. Push this repo to GitHub.
2. Web App → **Overview → Download publish profile**.
3. GitHub → **Settings → Secrets and variables → Actions → New repository secret**: name it `AZURE_WEBAPP_PUBLISH_PROFILE` and paste the file contents.
   (If the download is disabled, enable **Configuration → General settings → SCM Basic Auth Publishing Credentials**.)
4. Edit `AZURE_WEBAPP_NAME` in `.github/workflows/azure-webapp.yml` to your app's name.
5. Push to `main`. The workflow builds and deploys automatically.

Check `https://<your-app>.azurewebsites.net/api/health` (ours: [live health check](https://wanderly-teju-befehjcsakc3c3cu.centralindia-01.azurewebsites.net/api/health)). It should return `{"status":"ok","database":"connected"}`.

### Alternative: Azure CLI (no GitHub)

```bash
npm ci && npm run build && npm prune --omit=dev
zip -qr release.zip dist server src/data node_modules package.json package-lock.json
az webapp deploy --resource-group <rg> --name <app-name> --src-path release.zip --type zip
```

### Troubleshooting

- **`/api/health` shows `unreachable`**: check the SQL server firewall ("Allow Azure services") and your environment variables.
- **First request is slow**: a serverless database auto-pauses and takes a few seconds to resume. The connection timeout is set to 30s for this.
- **Logs**: Web App → **Log stream**.

## Design

The visual language borrows from boarding passes and travel documents: destination cards render as ticket stubs with perforated notches, a dashed divider, and a monospaced "flight code" for each place. Typefaces are Fraunces (display serif), Inter (body/UI), and IBM Plex Mono (data: prices, coordinates, ratings). The palette is a deep pine ink, warm paper, sea teal, and compass-brass gold.

## Project structure

```
server/
  index.js              Express app: /api + static dist/ + SPA fallback
  middleware.js         Visitor identity, rate limiting, error mapping
  routes/api.js         REST endpoints
  repositories/         Catalog loading + caching
  db/pool.js            Azure SQL connection pool (env-configured)
  db/migrate.js         Runs schema.sql + seed (CLI and on startup)
  db/seed.js            Builds the T-SQL seed from src/data
  sql/schema.sql        Tables, constraints, indexes
  sql/seed.sql          Generated catalog seed
src/
  lib/api.js            Fetch client + anonymous visitor id
  context/              Catalog, Wishlist, Theme, Toast providers
  components/ pages/ layouts/ hooks/ data/
.github/workflows/      Azure App Service deployment
```

## Future improvements

- Real accounts (Microsoft Entra External ID) so wishlists sync across devices
- Admin view for contact messages and catalog editing
- Managed Identity for passwordless database access
- Unit and end-to-end tests

## Photography credit

All photography is sourced from [Unsplash](https://unsplash.com) and used under the [Unsplash License](https://unsplash.com/license).
