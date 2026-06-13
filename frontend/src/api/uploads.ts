import { apiClient, unwrap } from '@/api/client'
import type { components } from '@/api/schema'

export type InitiateUploadRequest = components['schemas']['InitiateUploadRequest']
export type InitiateUploadResponse = components['schemas']['InitiateUploadResponse']
export type SignPartsResponse = components['schemas']['SignPartsResponse']
export type ListPartsResponse = components['schemas']['ListPartsResponse']
export type CompletePart = components['schemas']['CompletePart']
export type CompleteUploadResponse = components['schemas']['CompleteUploadResponse']

/**
 * S3 multipart upload control plane. The browser talks to these endpoints to
 * orchestrate the upload, but the part bytes are PUT directly to S3 via the
 * presigned URLs returned by `signParts` (see `lib/upload/multipartUpload.ts`).
 */
export const uploadsApi = {
  initiate(body: InitiateUploadRequest): Promise<InitiateUploadResponse> {
    return unwrap(apiClient.POST('/api/uploads', { body }))
  },

  signParts(videoKey: string, uploadId: string, partNumbers: number[]): Promise<SignPartsResponse> {
    return unwrap(
      apiClient.POST('/api/uploads/{video_key}/parts:sign', {
        params: { path: { video_key: videoKey } },
        body: { upload_id: uploadId, part_numbers: partNumbers },
      }),
    )
  },

  listParts(videoKey: string, uploadId: string): Promise<ListPartsResponse> {
    return unwrap(
      apiClient.GET('/api/uploads/{video_key}/parts', {
        params: { path: { video_key: videoKey }, query: { upload_id: uploadId } },
      }),
    )
  },

  complete(
    videoKey: string,
    uploadId: string,
    parts: CompletePart[],
  ): Promise<CompleteUploadResponse> {
    return unwrap(
      apiClient.POST('/api/uploads/{video_key}/complete', {
        params: { path: { video_key: videoKey } },
        body: { upload_id: uploadId, parts },
      }),
    )
  },
}
