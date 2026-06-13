/**
 * Map the snake_case API schema to camelCase domain types. Keeping this in one
 * place means a contract change surfaces here (after `pnpm gen:api`) rather
 * than scattered across components.
 */
import type { components } from '@/api/schema'
import type { Resolution, Video, VideoStatus, VideoSummary } from '@/types/video'

type ApiVideoSummary = components['schemas']['VideoSummary']
type ApiVideoDetail = components['schemas']['VideoDetail']

const KNOWN_STATUSES: ReadonlySet<string> = new Set<VideoStatus>([
  'uploading',
  'queued',
  'processing',
  'ready',
  'failed',
])

/** Narrow the API's free-form status string to the domain union (defensively). */
function toStatus(status: string): VideoStatus {
  return KNOWN_STATUSES.has(status) ? (status as VideoStatus) : 'processing'
}

function toResolutions(resolutions: string[] | undefined): Resolution[] {
  return (resolutions ?? []) as Resolution[]
}

export function toVideoSummary(v: ApiVideoSummary): VideoSummary {
  return {
    key: v.video_key,
    title: v.title,
    category: v.category,
    status: toStatus(v.status),
    durationSeconds: v.duration_seconds ?? null,
    resolutions: toResolutions(v.resolutions),
    createdAt: v.created_at,
    posterPath: v.poster_path ?? null,
  }
}

export function toVideoDetail(v: ApiVideoDetail): Video {
  return {
    key: v.video_key,
    title: v.title,
    category: v.category,
    status: toStatus(v.status),
    durationSeconds: v.duration_seconds ?? null,
    resolutions: toResolutions(v.resolutions),
    createdAt: v.created_at,
    posterPath: v.poster_path ?? null,
    updatedAt: v.updated_at,
    originalFilename: v.original_filename,
    size: v.size,
    error: v.error_message ?? null,
    manifestPath: v.manifest_path ?? null,
    thumbnailsVttPath: v.thumbnails_vtt_path ?? null,
  }
}
