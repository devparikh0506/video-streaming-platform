import { apiClient, unwrap } from '@/api/client'
import { toVideoDetail, toVideoSummary } from '@/api/mappers'
import { config } from '@/lib/config'
import type { Video, VideoStatus, VideoSummary } from '@/types/video'

export interface VideoListParams {
  category?: string
  status?: VideoStatus | string
  limit?: number
  cursor?: string
}

export interface VideoListPage {
  items: VideoSummary[]
  nextCursor: string | null
}

/** Read + lifecycle endpoints for videos. Uploads live in `api/uploads.ts`. */
export const videosApi = {
  async list(params: VideoListParams = {}): Promise<VideoListPage> {
    const data = await unwrap(
      apiClient.GET('/api/videos', {
        params: {
          query: {
            category: params.category,
            status: params.status,
            limit: params.limit,
            cursor: params.cursor,
          },
        },
      }),
    )
    return {
      items: data.items.map(toVideoSummary),
      nextCursor: data.next_cursor ?? null,
    }
  },

  async get(key: string): Promise<Video> {
    const data = await unwrap(
      apiClient.GET('/api/videos/{video_key}', { params: { path: { video_key: key } } }),
    )
    return toVideoDetail(data)
  },

  async categories(): Promise<string[]> {
    const data = await unwrap(apiClient.GET('/api/videos/categories'))
    return data.categories
  },

  async remove(key: string): Promise<void> {
    await unwrap(
      apiClient.DELETE('/api/videos/{video_key}', { params: { path: { video_key: key } } }),
    )
  },

  async hide(key: string): Promise<string> {
    const data = await unwrap(
      apiClient.POST('/api/videos/{video_key}/hide', { params: { path: { video_key: key } } }),
    )
    return data.visibility
  },

  async restore(key: string): Promise<string> {
    const data = await unwrap(
      apiClient.POST('/api/videos/{video_key}/restore', { params: { path: { video_key: key } } }),
    )
    return data.visibility
  },

  /** Absolute URL to a DASH file (manifest or segment) — supports range requests. */
  dashUrl(key: string, filename: string): string {
    return `${config.apiBaseUrl}/videos/${key}/dash/${filename}`
  },

  /**
   * Absolute URL to the DASH manifest. Prefers the server-provided
   * `manifest_path`; otherwise falls back to the conventional location.
   */
  manifestUrl(video: Pick<Video, 'key' | 'manifestPath'>): string {
    return resolveServerPath(video.manifestPath) ?? this.dashUrl(video.key, 'manifest.mpd')
  },

  /** Absolute poster URL, or null when the video has no poster yet. */
  posterUrl(video: Pick<VideoSummary, 'posterPath'>): string | null {
    return resolveServerPath(video.posterPath)
  },

  /**
   * Absolute URL to the WebVTT sprite-thumbnail index for scrub previews, or
   * null when unavailable. Shaka resolves the sprite image relative to it.
   */
  thumbnailsUrl(video: Pick<Video, 'thumbnailsVttPath'>): string | null {
    return resolveServerPath(video.thumbnailsVttPath)
  },
}

/** Resolve a server-relative API path to an absolute URL (passes through absolute URLs). */
function resolveServerPath(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${config.apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}
