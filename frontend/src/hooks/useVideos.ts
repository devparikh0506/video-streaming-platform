import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { videosApi, type VideoListPage } from '@/api/videos'
import { JOB_POLL_INTERVAL_MS, queryKeys } from '@/lib/queryClient'
import type { Video, VideoStatus, VideoSummary } from '@/types/video'

const PAGE_SIZE = 24

export interface VideoFilters {
  category?: string
  status?: VideoStatus | string
}

function isTransient(status: VideoStatus): boolean {
  return status !== 'ready' && status !== 'failed'
}

function isProcessing(video: Video | VideoSummary | undefined): boolean {
  return video != null && isTransient(video.status)
}

/**
 * Paginated video list via cursor-based infinite query. Pages are flattened by
 * the caller (`data.pages.flatMap(p => p.items)`).
 *
 * Polls while any loaded item is still transcoding (`queued` / `processing` /
 * `uploading`) so the list advances to `ready` / `failed` on its own, then
 * stops — see the Status lifecycle in `docs/frontend-integration.md`.
 */
export function useVideos(filters: VideoFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos(filters),
    queryFn: ({ pageParam }) => videosApi.list({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: (query) => {
      const pages = query.state.data?.pages as VideoListPage[] | undefined
      const anyTransient = pages?.some((page) => page.items.some((v) => isTransient(v.status)))
      return anyTransient ? JOB_POLL_INTERVAL_MS : false
    },
  })
}

/**
 * Single video. While it is still processing, the query polls so the UI walks
 * through status transitions toward `ready` / `failed` on its own.
 */
export function useVideo(key: string) {
  return useQuery({
    queryKey: queryKeys.video(key),
    queryFn: () => videosApi.get(key),
    enabled: key.length > 0,
    refetchInterval: (query) => (isProcessing(query.state.data) ? JOB_POLL_INTERVAL_MS : false),
  })
}

/** Distinct categories for filter chips. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => videosApi.categories(),
    staleTime: 5 * 60_000,
  })
}
