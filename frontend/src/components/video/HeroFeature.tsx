import { Link } from 'react-router-dom'
import type { VideoSummary } from '@/types/video'
import { formatDuration } from '@/lib/format'
import { videosApi } from '@/api/videos'
import { Icon } from '@/components/ui/Icon'
import { Tag } from '@/components/ui/Tag'
import { Poster } from '@/components/video/Poster'

/** Editorial feature banner: copy on one side, large poster on the other. */
export function HeroFeature({ video }: { video: VideoSummary }) {
  return (
    <section className="hero" aria-label={`Featured: ${video.title}`}>
      <div className="hero__content">
        <p className="hero__eyebrow">
          <Icon name="sparkles" />
          Featured
        </p>
        <h1 className="hero__title">{video.title}</h1>
        <div className="hero__meta">
          <Tag variant="accent">{video.category}</Tag>
          <span>{formatDuration(video.durationSeconds)}</span>
          {video.resolutions.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{video.resolutions.join(' / ')}</span>
            </>
          )}
        </div>
        <div className="hero__actions">
          <Link to={`/videos/${video.key}`} className="btn btn--primary btn--lg">
            <Icon name="play" />
            Play now
          </Link>
          <Link to={`/videos/${video.key}`} className="btn btn--secondary btn--lg">
            <Icon name="info" />
            Details
          </Link>
        </div>
      </div>

      <Link to={`/videos/${video.key}`} className="hero__media" aria-hidden="true" tabIndex={-1}>
        <Poster
          videoKey={video.key}
          title={video.title}
          durationSeconds={video.durationSeconds}
          posterUrl={videosApi.posterUrl(video)}
        />
      </Link>
    </section>
  )
}
