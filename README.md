# AIO3-APP

A minimal fullstack starter: React + Vite front end, Express API, PostgreSQL — wired together with Docker Compose.

## Layout

| Path | What it is |
| --- | --- |
| `frontend/` | Vite dev server (host port 3000), single page that lists/adds/deletes items |
| `backend/` | Express API on port 8000, talks to Postgres via `pg` |
| `backend/db/` | `schema.sql` + `seed.sql`, applied by the one-shot `migrate` service |
| `docker-compose.base44.yml` | The development stack used by the sandbox |

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
```

Then open <http://localhost:3000>. All source is bind-mounted, so edits hot-reload:
the front end through Vite HMR, the API through `node --watch`.

API endpoints: `GET /api/health`, `GET /api/items`, `POST /api/items`, `DELETE /api/items/:id`.

The API is not published on a host port — the browser only ever talks to port 3000, and
Vite proxies `/api` to the API service (single-origin dev, so no CORS setup is needed).

Logs: `docker compose -f docker-compose.base44.yml logs -f web api`
Stop: `docker compose -f docker-compose.base44.yml down`
