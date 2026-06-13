/**
 * Browser-side orchestration of the S3 multipart upload flow:
 *
 *   1. POST /uploads                     → video_key, upload_id, part_size, part_count
 *   2. GET  /uploads/{key}/parts         → parts S3 already has (resume support)
 *   3. POST /uploads/{key}/parts:sign    → presigned PUT URL per part
 *   4. PUT  <presigned-url>  (direct S3) → ETag header per part
 *   5. POST /uploads/{key}/complete      → finalize
 *
 * Parts are signed and uploaded one at a time so short-lived presigned URLs
 * don't expire mid-flight on large files, and so progress can be reported and
 * the transfer aborted between parts.
 */
import { uploadsApi, type CompletePart } from '@/api/uploads'

export interface UploadProgress {
  uploadedBytes: number
  totalBytes: number
  percent: number
}

export interface UploadCallbacks {
  /** Fired once the server has issued a `video_key` (before bytes transfer). */
  onInit?: (videoKey: string) => void
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

export interface UploadParams extends UploadCallbacks {
  file: File
  title: string
  category: string
}

function progressOf(uploadedBytes: number, totalBytes: number): UploadProgress {
  return {
    uploadedBytes,
    totalBytes,
    percent: totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0,
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new DOMException('Upload aborted', 'AbortError')
}

/** PUT one part's bytes directly to S3 and return its ETag. */
async function putPart(url: string, body: Blob, signal: AbortSignal | undefined): Promise<string> {
  const response = await fetch(url, { method: 'PUT', body, signal })
  if (!response.ok) {
    throw new Error(`Part upload failed (HTTP ${response.status})`)
  }
  const etag = response.headers.get('ETag') ?? response.headers.get('etag')
  if (!etag) {
    throw new Error(
      'S3 did not expose an ETag header — check the bucket CORS config (ExposeHeaders: ETag).',
    )
  }
  return etag.replaceAll('"', '')
}

/**
 * Run a full multipart upload and return the final `video_key`.
 * Throws `AbortError` if the provided signal is aborted.
 */
export async function uploadVideo(params: UploadParams): Promise<string> {
  const { file, title, category, onInit, onProgress, signal } = params

  throwIfAborted(signal)
  const init = await uploadsApi.initiate({
    filename: file.name,
    content_type: file.type || 'application/octet-stream',
    size: file.size,
    title,
    category,
  })
  onInit?.(init.video_key)

  // Resume: parts S3 already holds can be skipped.
  const existing = await uploadsApi.listParts(init.video_key, init.upload_id).catch(() => null)
  const knownEtags = new Map<number, string>()
  existing?.parts.forEach((part) => knownEtags.set(part.part_number, part.etag))

  const parts: CompletePart[] = []
  let uploadedBytes = 0
  onProgress?.(progressOf(0, file.size))

  for (let partNumber = 1; partNumber <= init.part_count; partNumber += 1) {
    throwIfAborted(signal)

    const start = (partNumber - 1) * init.part_size
    const end = Math.min(start + init.part_size, file.size)
    const chunk = file.slice(start, end)

    const cachedEtag = knownEtags.get(partNumber)
    if (cachedEtag) {
      parts.push({ part_number: partNumber, etag: cachedEtag })
    } else {
      const signed = await uploadsApi.signParts(init.video_key, init.upload_id, [partNumber])
      const url = signed.urls[String(partNumber)]
      if (!url) throw new Error(`Server did not return a signed URL for part ${partNumber}`)
      const etag = await putPart(url, chunk, signal)
      parts.push({ part_number: partNumber, etag })
    }

    uploadedBytes += chunk.size
    onProgress?.(progressOf(uploadedBytes, file.size))
  }

  parts.sort((a, b) => a.part_number - b.part_number)
  const result = await uploadsApi.complete(init.video_key, init.upload_id, parts)
  return result.video_key
}
