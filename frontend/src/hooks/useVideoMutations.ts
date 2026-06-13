import { useMutation, useQueryClient } from '@tanstack/react-query'
import { videosApi } from '@/api/videos'
import { queryKeys } from '@/lib/queryClient'

/** Invalidate every video list and the affected detail after a lifecycle change. */
function useInvalidateVideos() {
  const queryClient = useQueryClient()
  return (key?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.videosRoot })
    if (key) queryClient.invalidateQueries({ queryKey: queryKeys.video(key) })
  }
}

/** Hard delete a video (removes S3 objects + metadata). */
export function useDeleteVideo() {
  const invalidate = useInvalidateVideos()
  return useMutation({
    mutationFn: (key: string) => videosApi.remove(key),
    onSuccess: (_data, key) => invalidate(key),
  })
}

/** Soft delete: hide from listings without removing files. */
export function useHideVideo() {
  const invalidate = useInvalidateVideos()
  return useMutation({
    mutationFn: (key: string) => videosApi.hide(key),
    onSuccess: (_data, key) => invalidate(key),
  })
}

/** Undo a soft delete. */
export function useRestoreVideo() {
  const invalidate = useInvalidateVideos()
  return useMutation({
    mutationFn: (key: string) => videosApi.restore(key),
    onSuccess: (_data, key) => invalidate(key),
  })
}
