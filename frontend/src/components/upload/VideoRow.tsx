import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { VideoSummary } from '@/types/video'
import { posterArt } from '@/lib/poster'
import { formatDuration } from '@/lib/format'
import { videosApi } from '@/api/videos'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { IconButton } from '@/components/ui/IconButton'

const STATUS_HINT: Record<VideoSummary['status'], string> = {
  uploading: 'Uploading',
  queued: 'Waiting in queue',
  processing: 'Transcoding…',
  ready: 'Ready to stream',
  failed: 'Processing failed',
}

interface VideoRowProps {
  video: VideoSummary
  onDelete: (key: string) => void
  deleting?: boolean
}

/** A library video in the dashboard feed: status, quick play, and delete. */
export function VideoRow({ video, onDelete, deleting = false }: VideoRowProps) {
  const isProcessing = video.status === 'processing' || video.status === 'queued'
  const posterUrl = videosApi.posterUrl(video)
  const [posterFailed, setPosterFailed] = useState(false)
  const showPoster = Boolean(posterUrl) && !posterFailed

  return (
    <article className={`job${video.status === 'failed' ? ' job--failed' : ''}`}>
      <div className="job__thumb">
        {showPoster ? (
          <img
            className="job__thumb-img"
            src={posterUrl ?? undefined}
            alt=""
            loading="lazy"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <span
            className="job__thumb-art"
            style={{ background: posterArt(video.key).background }}
          />
        )}
      </div>

      <div className="job__main">
        <span className="job__title">{video.title}</span>
        <span className="job__sub">
          <span>{video.category}</span>
          <span className="job__sub-dot" />
          <span>{formatDuration(video.durationSeconds)}</span>
          <span className="job__sub-dot" />
          <span>{STATUS_HINT[video.status]}</span>
        </span>
        {isProcessing && (
          <div className="job__progress-wrap">
            <ProgressBar indeterminate />
          </div>
        )}
      </div>

      <div className="job__aside">
        <StatusBadge status={video.status} />
        {video.status === 'ready' && (
          <Link to={`/videos/${video.key}`} className="btn btn--secondary btn--sm">
            <Icon name="play" />
            Play
          </Link>
        )}
        <IconButton
          icon="trash"
          label={`Delete ${video.title}`}
          onClick={() => onDelete(video.key)}
          disabled={deleting}
        />
      </div>
    </article>
  )
}
