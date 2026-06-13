import { Link } from 'react-router-dom'
import type { VideoSummary } from '@/types/video'
import { formatDuration } from '@/lib/format'
import { videosApi } from '@/api/videos'
import { Poster } from '@/components/video/Poster'

interface VideoCardProps {
  video: VideoSummary
}

/** Clickable poster + title card used in shelves and grids. */
export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link to={`/videos/${video.key}`} className="video-card">
      <Poster
        videoKey={video.key}
        title={video.title}
        durationSeconds={video.durationSeconds}
        posterUrl={videosApi.posterUrl(video)}
      />
      <div className="video-card__body">
        <span className="video-card__title">{video.title}</span>
        <span className="video-card__meta">
          <span>{video.category}</span>
          {video.durationSeconds != null && video.durationSeconds > 0 && (
            <>
              <span className="video-card__meta-dot" />
              <span>{formatDuration(video.durationSeconds)}</span>
            </>
          )}
        </span>
      </div>
    </Link>
  )
}
