# OAU Thesis Bank — Backend

Django REST Framework API for the OAU Thesis Bank.
PostgreSQL 16 + MinIO (S3-compatible object storage) + Django dev server, all via Docker Compose.

## Run locally with Docker

Prerequisites: Docker Engine with Compose v2 (Docker Desktop on macOS/Windows works too).

```bash
git clone <repository-url> && cd oau-thesis-bank/backend

# Build and start the full stack (db + minio + minio-init + backend).
# The backend container automatically runs wait_for_db -> migrate -> runserver.
docker compose up --build -d

# Optional: load demo data (theses, users, researcher profiles, opportunities).
docker compose exec backend python manage.py seed
```

Then open:

- Swagger UI:  http://localhost:8000/api/docs/
- ReDoc:       http://localhost:8000/api/docs/redoc/
- OpenAPI:     http://localhost:8000/api/schema/
- MinIO console (object storage): http://localhost:9001/ (user `oau`, password `oau-thesis-secret`)

### Demo accounts (created by `seed`)

| Email | Role | Notes |
|---|---|---|
| `u1@demo.local` | researcher | owns theses |
| `u2@demo.local` | faculty | mentor, analytics access |
| `u3@demo.local` | faculty | second mentor |

Password for all: `oau-thesis-demo-password`

## Ports

| Port | Service | Notes |
|---|---|---|
| 8000 | Django API | main endpoint |
| 5432 | PostgreSQL | change the `db > ports` mapping if you already run Postgres locally |
| 9000 / 9001 | MinIO API / console | |

Stop everything with `docker compose down` (volumes persist; wipe data with `docker compose down -v`).

## Configuration

All settings have sane dev defaults — override via environment variables in `docker-compose.yml`
(or your own `compose.override.yml`).

| Variable | Default | Purpose |
|---|---|---|
| `DJANGO_DEBUG` | `1` | dev mode |
| `DJANGO_SECRET_KEY` | insecure dev key | set in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | comma-separated |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | `oau_thesis_bank` / `oau` / `oau` | database |
| `POSTGRES_HOST` / `POSTGRES_PORT` | `db` / `5432` | database connection |
| `STORAGE_PROVIDER` | `minio` | `minio`, `s3`, or `r2` (Cloudflare R2 for prod) |
| `AWS_S3_ENDPOINT_URL` | `http://minio:9000` | S3 endpoint |
| `AWS_S3_ACCESS_KEY_ID` / `AWS_S3_SECRET_ACCESS_KEY` | `oau` / `oau-thesis-secret` | object store credentials |
| `AWS_STORAGE_BUCKET_NAME` | `oau-thesis-bank` | bucket (MinIO: auto-created by `minio-init`) |
| `EMAIL_BACKEND` | console | `django.core.mail.backends.console.EmailBackend` in dev |
| `EMAIL_NOTIFICATIONS_ENABLED` | off | set `1` to fan out notifications by email |

## Common tasks

```bash
# create an admin (admins cannot be registered via the API)
docker compose exec backend python manage.py createsuperuser

# apply new migrations after pulling
docker compose exec backend python manage.py migrate

# run the test suite
docker compose exec backend sh -c "uv sync --dev && pytest"
# or from the host (requires uv): uv run pytest
```

## Repository layout

- `accounts` — custom user, `/api/auth/*` (register, login, refresh, me, change-password)
- `theses` — thesis CRUD, saves, downloads, access requests, `/api/theses/*`
- `search` — PostgreSQL full-text search, `/api/search/*`
- `researchers` — researcher profiles, `/api/researchers/*`
- `collaboration` — opportunities + mentorship, `/api/collaboration/*`
- `messaging` — 1-on-1 conversations + DMs, `/api/messages/*`
- `notifications` — in-app notifications, `/api/notifications/*`
- `analytics` — faculty/admin aggregates, `/api/analytics/*`
- `integrations` — GitHub/ORCID OAuth link endpoints, `/api/integrations/*`
- `core` — shared utilities (`wait_for_db`)

## Troubleshooting

- **`NoSuchBucket` on uploads** — the `minio-init` service creates the bucket on startup. Re-run
  `docker compose up -d` or create it manually: `mc alias set local http://localhost:9000 oau oau-thesis-secret && mc mb local/oau-thesis-bank`.
- **Docker Hub pull denied for MinIO** — the compose file pins `quay.io/minio/minio`, which does not require Docker Hub access. Don't switch it to `minio/minio`.
- **Port 5432 already in use** — change the host mapping, e.g. `"5433:5432"`.
- **Old database kept after re-seeding** — the PostgreSQL volume is named and persists across `docker compose down`. Run `docker compose down -v` (destroys all data) and `up` to start clean.