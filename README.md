# Zorexium-Games

## Running locally

```bash
npm install
npm start
```

The app is served by `server.js` on `0.0.0.0:${PORT:-10000}`.

## Persistence setup

Core app records now use the `/api/store/:store/:key` server API.

- Set `DATABASE_URL` to a Postgres connection string to enable Postgres-backed persistence.
- In `NODE_ENV=production`, the server enables Postgres SSL automatically (Render-compatible default uses `rejectUnauthorized: false`).
- Local/non-production defaults to no SSL unless `PGSSLMODE` is set.
- Optional overrides:
  - `PGSSLMODE=disable` to force SSL off.
  - `PG_SSL_NO_VERIFY=false` to require certificate verification.
- If `DATABASE_URL` is not set, the server uses an in-memory fallback (development only, non-persistent).

Health check:

```bash
GET /api/health
```