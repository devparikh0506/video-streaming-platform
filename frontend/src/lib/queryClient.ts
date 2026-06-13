import { QueryClient } from '@tanstack/react-query'

/** Polling cadence for in-progress transcode jobs (ms). */
export const JOB_POLL_INTERVAL_MS = 3000

/**
 * Shared TanStack Query client. Defaults are conservative: a short stale time
 * and no refetch-on-focus, since job status is driven by explicit polling
 * intervals on the hooks that need it.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/** Centralized query key factory to avoid stringly-typed cache keys. */
export const queryKeys = {
  /** Root key for all video lists — invalidate to refetch every filtered list. */
  videosRoot: ['videos', 'list'] as const,
  videos: (filters: { category?: string; status?: string } = {}) =>
    [
      'videos',
      'list',
      { category: filters.category ?? null, status: filters.status ?? null },
    ] as const,
  video: (key: string) => ['videos', 'detail', key] as const,
  categories: () => ['videos', 'categories'] as const,
}
