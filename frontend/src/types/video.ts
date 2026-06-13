/**
 * Domain types used across the UI (camelCase). These are mapped from the
 * snake_case API schema by `api/mappers.ts`, so components stay decoupled from
 * the wire format. Keep in step with `api/schema.d.ts` (generated from the
 * backend OpenAPI contract).
 */

export type VideoStatus = 'uploading' | 'queued' | 'processing' | 'ready' | 'failed'

/** Known transcode rungs; the API types this loosely as `string[]`. */
export type Resolution = '1080p' | '720p' | '480p'

export interface VideoSummary {
  /** Server-generated unique id (the API's `video_key`); also the folder name. */
  key: string
  title: string
  category: string
  status: VideoStatus
  /** Duration in seconds, if known. */
  durationSeconds: number | null
  resolutions: Resolution[]
  createdAt: string
  /** Path to the poster image once `ready` (API `poster_path`). */
  posterPath: string | null
}

export interface Video extends VideoSummary {
  originalFilename: string
  /** Size in bytes. */
  size: number
  updatedAt: string
  /** Populated only when `status === 'failed'` (API `error_message`). */
  error: string | null
  /** Relative path to the DASH manifest once `ready` (API `manifest_path`). */
  manifestPath: string | null
  /** Path to the WebVTT sprite-thumbnail index for scrub previews. */
  thumbnailsVttPath: string | null
}
