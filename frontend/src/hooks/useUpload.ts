import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { uploadVideo } from '@/lib/upload/multipartUpload'
import { queryKeys } from '@/lib/queryClient'

export type UploadState = 'uploading' | 'completing' | 'done' | 'error' | 'canceled'

export interface ActiveUpload {
  id: string
  videoKey: string | null
  title: string
  category: string
  filename: string
  size: number
  percent: number
  state: UploadState
  error: string | null
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError || err instanceof Error) return err.message
  return 'Upload failed'
}

/**
 * Manages a list of in-flight multipart uploads, each independently
 * cancellable, and refreshes the video lists when one completes.
 */
export function useUpload() {
  const [uploads, setUploads] = useState<ActiveUpload[]>([])
  const controllers = useRef(new Map<string, AbortController>())
  const queryClient = useQueryClient()

  const patch = useCallback((id: string, changes: Partial<ActiveUpload>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)))
  }, [])

  const start = useCallback(
    (file: File, title: string, category: string): string => {
      const id = crypto.randomUUID()
      const controller = new AbortController()
      controllers.current.set(id, controller)

      setUploads((prev) => [
        {
          id,
          videoKey: null,
          title,
          category,
          filename: file.name,
          size: file.size,
          percent: 0,
          state: 'uploading',
          error: null,
        },
        ...prev,
      ])

      uploadVideo({
        file,
        title,
        category,
        signal: controller.signal,
        onInit: (videoKey) => patch(id, { videoKey }),
        onProgress: (p) =>
          patch(id, { percent: p.percent, state: p.percent >= 100 ? 'completing' : 'uploading' }),
      })
        .then((videoKey) => {
          patch(id, { videoKey, percent: 100, state: 'done' })
          // Refresh the library, then drop this row from "Uploading now" — the
          // finished video now lives in the library list instead (awaiting the
          // refetch first avoids a flicker where it belongs to neither list).
          void queryClient
            .invalidateQueries({ queryKey: queryKeys.videosRoot })
            .finally(() => setUploads((prev) => prev.filter((u) => u.id !== id)))
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') {
            patch(id, { state: 'canceled' })
          } else {
            patch(id, { state: 'error', error: errorMessage(err) })
          }
        })
        .finally(() => controllers.current.delete(id))

      return id
    },
    [patch, queryClient],
  )

  /** Abort an in-flight upload. */
  const cancel = useCallback((id: string) => {
    controllers.current.get(id)?.abort()
  }, [])

  /** Remove a finished/failed row from the list (aborts if still running). */
  const dismiss = useCallback((id: string) => {
    controllers.current.get(id)?.abort()
    controllers.current.delete(id)
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return { uploads, start, cancel, dismiss }
}
