# Frontend

React + Vite + TypeScript client for the video streaming platform. Browse the
catalog by category, upload large videos via resumable S3 multipart transfers,
and play adaptive MPEG-DASH streams.

## Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **TanStack Query** — server state and job-status polling
- **React Router** — `Home`, `Dashboard`, `VideoDetail`, `NotFound`
- **openapi-fetch** + **openapi-typescript** — typed API client generated from
  the backend's OpenAPI schema (`pnpm gen:api`)
- **@vidstack/react** + **dashjs** — MPEG-DASH playback with seek-bar thumbnail
  previews
- **Vitest** + **React Testing Library** — unit/component tests
- **ESLint** + **Prettier**

## Getting started

```bash
pnpm install
cp .env.example .env     # adjust VITE_API_BASE_URL if needed
pnpm dev                 # http://localhost:5173
```

Within Docker the service is started via `pnpm dev --host 0.0.0.0` and reads
`VITE_API_BASE_URL` from compose (defaults to `http://localhost:8000/api`).

## Scripts

| Script                | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `pnpm dev`            | Start the Vite dev server                        |
| `pnpm build`          | Type-check (`tsc -b`) and bundle                 |
| `pnpm preview`        | Preview the production build                     |
| `pnpm lint`           | Run ESLint                                       |
| `pnpm format`         | Format with Prettier                             |
| `pnpm typecheck`      | Type-check without emitting                      |
| `pnpm gen:api`        | Regenerate API types from `../backend/openapi.yaml` |
| `pnpm test`           | Run the test suite once                          |
| `pnpm test:watch`     | Run tests in watch mode                          |
| `pnpm test:coverage`  | Run tests with a coverage report                 |

## Project structure

```text
src/
  api/          # Typed API client (openapi-fetch) + endpoint modules, envelope-aware
  app/          # Composition root: App, providers, router
  components/   # UI by feature
    layout/     # App shell (header, footer, page header)
    ui/         # Presentational primitives (Button, StatusBadge, ProgressBar, …)
    upload/     # Dropzone, active-upload rows, stat tiles
    video/      # Player shell, video cards/grid, metadata panel, poster
  hooks/        # TanStack Query hooks (useVideos, useUpload, useVideoMutations)
  lib/          # Config, query client, formatters, multipart upload orchestration
  pages/        # Route components (Home, Dashboard, VideoDetail, NotFound)
  styles/       # Global CSS + design tokens
  test/         # Test setup and render helpers
  types/        # Shared domain + API types
```

The `@/` alias maps to `src/` (configured in `vite.config.ts` and
`tsconfig.app.json`).

## Pages

- **Home** — catalog grouped by category with a hero feature, newest-first.
- **Dashboard** — upload new videos, track active transfers and job status,
  and manage the library (hide / restore / delete).
- **Video detail** — DASH player with poster, scrub-preview thumbnails, and
  metadata; polls until the video is `ready`.

## Uploads

Large files are uploaded directly to S3 using the backend's presigned multipart
flow — the browser never routes bytes through the API. The orchestration lives
in [src/lib/upload/multipartUpload.ts](src/lib/upload/multipartUpload.ts):

1. `POST /uploads` → `video_key`, `upload_id`, `part_size`, `part_count`
2. `GET /uploads/{key}/parts` → parts S3 already holds (resume support)
3. `POST /uploads/{key}/parts:sign` → a presigned `PUT` URL per part
4. `PUT <presigned-url>` directly to S3 → an ETag per part
5. `POST /uploads/{key}/complete` → finalize and enqueue transcoding

Parts are signed and sent one at a time so short-lived presigned URLs don't
expire mid-transfer, progress can be reported, and an upload can be aborted or
resumed between parts.

## API types

The client is fully typed against the backend contract. After changing a
backend endpoint, regenerate the types:

```bash
pnpm gen:api    # reads ../backend/openapi.yaml → src/api/schema.d.ts
```
