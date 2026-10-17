# Working in this repo

## Running the app

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Web entry point: host port **3000** (Vite dev server, container port 5173).
- The API is reachable only inside the compose network (`api:8000`); the browser talks to
  `/api` on port 3000 and Vite proxies it. Keep it that way — it avoids CORS and cookie
  origin issues. `API_PROXY_TARGET` overrides the proxy target if ever needed.
- Postgres data lives in the `pgdata` named volume. Never delete that volume to "fix"
  something — it holds the user's data.

## Gotchas

- `npm ci` runs at container startup (deps live in named volumes, not in the image), so
  **`package-lock.json` must stay in sync with `package.json`**. After changing
  dependencies, regenerate the lockfile, e.g.:
  `docker run --rm -v "$PWD/frontend:/app" -w /app node:22-alpine npm install --package-lock-only`
  (same for `backend/`), otherwise the container fails to start with a `npm ci` error.
- The `migrate` service re-runs on every `up`; `backend/db/*.sql` must stay idempotent.
  Adding a migration means adding a new idempotent statement or file.
- Schema changes need `migrate` to run again: `docker compose -f docker-compose.base44.yml up -d --force-recreate migrate api`.
- The API uses `node --watch`, so backend edits reload on their own. Compose, env or
  dependency changes need `docker compose -f docker-compose.base44.yml up -d --build`.

## Verifying it works

- `curl -s localhost:3000 | head` returns the Vite HTML shell (not a prebuilt bundle).
- `docker compose -f docker-compose.base44.yml exec -T api wget -qO- localhost:8000/api/items`
  returns JSON from Postgres.
- Both `api` and `web` have compose healthchecks; `docker compose ps` shows healthy.

## Base44 sandbox notes

- `BASE44_PREVIEW_MODE` is passed through to `web`/`api` as a bare compose entry and is
  `"1"` only in the hosted sandbox; nothing in this app currently branches on it.
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is provided by the platform so the Vite dev
  server accepts the preview's external hostname. Both are no-ops locally.
- No external service credentials are required — Postgres runs inside compose with a
  local-only password, and `.base44/environment.json` lists no secrets.
