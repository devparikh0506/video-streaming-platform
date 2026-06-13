import type { VideoStatus } from '@/types/video'

const LABELS: Record<VideoStatus, string> = {
  uploading: 'Uploading',
  queued: 'Queued',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
}

/** Small colored pill with a status dot reflecting a video's processing state. */
export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" />
      {LABELS[status]}
    </span>
  )
}
