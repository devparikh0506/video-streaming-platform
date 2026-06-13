# StreamForge

A dockerized video streaming platform engineered for secure, scalable,
low-latency delivery. Upload large video files directly to object storage,
transcode them into a multi-resolution adaptive ladder, and stream them back as
MPEG-DASH in the browser — Netflix style.

<p>
  <img alt="Python 3.12+" src="https://img.shields.io/badge/python-3.12+-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Celery" src="https://img.shields.io/badge/Celery-workers-37814A?logo=celery&logoColor=white">
  <img alt="Docker Compose" src="https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white">
</p>

## Highlights

- **Direct-to-S3 resumable uploads.** The browser uploads multi-gigabyte files
  straight to S3 via presigned multipart URLs — the API issues URLs and
  finalizes, but never proxies the bytes. Interrupted uploads resume from the
  last received part.
- **Asynchronous transcoding.** Celery workers claim jobs with a DynamoDB lease
  (one worker per video, stale leases reclaimed), run ffmpeg to produce a
  1080p / 720p / 480p DASH ladder (no upscaling beyond the source), and upload
  the manifest + segments back to S3.
- **Adaptive DASH streaming.** Segments are served with HTTP range support and
  correct MIME types; the frontend plays them with dash.js and adapts quality
  to bandwidth.
- **Catalog with soft delete.** Cursor-paginated listing by category or full
  feed (DynamoDB GSIs), plus hide / restore / hard-delete.
- **Local-first, cloud-ready.** Runs end-to-end on LocalStack (S3 + DynamoDB)
  with one command; switch to real AWS by changing environment variables only —
  no code changes.

## Architecture

```
   ┌──────────┐   S3 multipart   ┌─────────┐    enqueue    ┌────────┐
   │  React   │   (presigned)    │ FastAPI │ ───────────►  │ Celery │
   │ frontend │ ◄──────────────► │ backend │  ◄─ status ─  │ worker │
   └──────────┘  DASH/metadata   └────┬────┘               └───┬────┘
        ▲           (S3 / DB)         │                        │ ffmpeg
        └─────────────────────────────┘                  transcode → DASH
                                       │                        │
                          Redis (broker + result backend)  ─────┘
                                       │
                 S3 = object store  ·  DynamoDB = metadata
```

| Service      | Tech                       | Responsibility                                          |
| ------------ | -------------------------- | ------------------------------------------------------- |
| `backend`    | FastAPI (Python 3.12+)     | Presigned multipart uploads, catalog API, DASH streaming |
| `worker`     | Celery + ffmpeg            | Transcode raw video → multi-resolution DASH             |
| `redis`      | Redis 7                    | Celery broker + result backend                          |
| `localstack` | LocalStack                 | S3 bucket + DynamoDB table for local dev                |
| `frontend`   | React 19 + Vite + dash.js  | Upload dashboard, catalog, player                       |

## Quick start

Runs the whole stack — frontend, API, worker, Redis, and LocalStack — with one
command.

**Prerequisites:** Docker + Docker Compose.

```bash
# 1. Create the environment files from the checked-in templates
cp .env.example .env                     # root: LocalStack token (optional), worker concurrency
cp backend/.env.example backend/.env     # backend + worker config
cp frontend/.env.example frontend/.env   # frontend API base URL

# 2. Start everything
docker compose up --build

# 3. Provision the S3 bucket + DynamoDB table in LocalStack (first run only)
cd infra/terraform
tflocal init && tflocal apply -auto-approve
```

Then open:

| URL                                   | What                       |
| ------------------------------------- | -------------------------- |
| http://localhost:5173                 | Frontend (upload + browse) |
| http://localhost:8000/api/health      | Backend health check       |
| http://localhost:8000/docs            | Interactive API docs        |

> The root `.env` only needs `LOCALSTACK_AUTH_TOKEN` if you use LocalStack Pro
> features or the Cloud dashboard; community S3/DynamoDB work without it.

## Local development (without full compose)

Run the dependencies in containers and the app processes on the host for faster
reloads:

```bash
# Start just Redis + LocalStack
docker compose up redis localstack -d

# Backend API (in backend/)
uv sync
uvicorn app.main:app --reload --port 8000

# Celery worker (in backend/)
celery -A app.workers.celery_app:celery_app worker --loglevel=info

# Frontend (in frontend/)
pnpm install && pnpm dev
```

## How it works

**Upload (4-step handshake).** `POST /api/uploads` initiates and returns a
`video_key` + S3 `upload_id` + part plan → the client requests presigned `PUT`
URLs (`/parts:sign`), uploads parts directly to S3, and can list already-received
parts (`/parts`) to resume → `POST /api/uploads/{key}/complete` finalizes and
enqueues a transcode job. The backend validates content type and size and never
touches the file bytes.

**Transcode.** A worker claims the job with a lease (`locked_until`), renews it
while encoding, runs `ffprobe` + `ffmpeg -f dash` to build the resolution ladder,
uploads `manifest.mpd` and segments to `uploads/{key}/dash/`, then marks the
video `ready`. Failures roll the job back to the queue and retry (up to 3×).

**Stream.** `GET /api/videos/{key}/dash/{file}` serves the manifest and segments
from S3 with `Accept-Ranges` / `Content-Range` support and correct MIME types
(`application/dash+xml`, `video/mp4`). dash.js requests the ladder and adapts.

Status flows: `uploading → queued → processing → ready | failed`.

## Project structure

```
video-streaming-platform/
├── backend/            # FastAPI app, Celery workers, tests          → backend/README.md
│   └── app/{clients,common,core,modules,repositories,workers}
├── frontend/           # React + Vite + TypeScript client            → frontend/README.md
│   └── src/{api,app,components,hooks,lib,pages,styles}
├── infra/terraform/    # S3 bucket + DynamoDB table (tflocal/AWS)    → infra/terraform/README.md
├── docker-compose.yml  # Full local stack
└── .env.example        # Root env template (compose substitution)
```

## Testing

```bash
# Backend (pytest + httpx, S3/DynamoDB mocked in-memory)
cd backend && pytest --cov=app

# Frontend (Vitest + React Testing Library)
cd frontend && pnpm test
```

## Deploying to real AWS

No code changes required — point the same environment variables at AWS:

```bash
AWS_ENDPOINT_URL=                 # empty → boto3 uses real AWS endpoints
AWS_PUBLIC_ENDPOINT_URL=          # empty → real endpoint for presigned URLs
AWS_DEFAULT_REGION=<your-region>
S3_BUCKET=<your-bucket>
S3_USE_PATH_STYLE=false           # real S3 prefers virtual-hosted style
AWS_ACCESS_KEY_ID=<real-key>
AWS_SECRET_ACCESS_KEY=<real-secret>
```

Provision the bucket and table with the same Terraform under `infra/terraform/`
(run `terraform` instead of `tflocal`, with AWS credentials configured).

## Documentation

- [Backend](backend/README.md) — API reference, data model, transcoding pipeline, config
- [Frontend](frontend/README.md) — stack, pages, upload flow, API type generation
- [Infrastructure](infra/terraform/README.md) — Terraform resources and DynamoDB key design

## Scope

This is an MVP focused on the upload → transcode → stream path. It intentionally
has no authentication or user accounts, DASH only (no HLS/DRM), and targets a
single region. All videos are public once `ready`.
