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
- If `DATABASE_URL` is not set, the server uses an in-memory fallback (development only, non-persistent).

Health check:

```bash
GET /api/health
```