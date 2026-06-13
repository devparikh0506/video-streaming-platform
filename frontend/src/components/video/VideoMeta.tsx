import type { Video } from '@/types/video'
import { formatDuration } from '@/lib/format'
import { Tag } from '@/components/ui/Tag'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'

/** Title, category, duration, status, and resolutions below the player. */
export function VideoMeta({ video }: { video: Video }) {
  return (
    <div className="video-meta">
      <h1 className="video-meta__title">{video.title}</h1>
      <div className="video-meta__row">
        <Tag variant="accent">{video.category}</Tag>
        <span>{formatDuration(video.durationSeconds)}</span>
        <span aria-hidden="true">·</span>
        <StatusBadge status={video.status} />
        {video.resolutions.length > 0 && (
          <span className="video-meta__resolutions">
            {video.resolutions.map((res) => (
              <Tag key={res}>{res}</Tag>
            ))}
          </span>
        )}
      </div>
      {video.status === 'failed' && video.error && (
        <Alert variant="error" title="Processing failed">
          {video.error}
        </Alert>
      )}
    </div>
  )
}
