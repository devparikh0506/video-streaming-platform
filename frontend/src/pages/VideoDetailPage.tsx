import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useVideo } from '@/hooks/useVideos'
import { videosApi } from '@/api/videos'
import { Icon } from '@/components/ui/Icon'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApiError } from '@/api/client'
import { VideoMeta } from '@/components/video/VideoMeta'
import { MetadataPanel } from '@/components/video/MetadataPanel'

// Code-split the player (Vidstack + dash.js) so it loads only on this route.
const PlayerShell = lazy(() =>
  import('@/components/video/PlayerShell').then((m) => ({ default: m.PlayerShell })),
)

function PlayerFallback() {
  return (
    <div className="player">
      <div className="player__stage">
        <div className="player__placeholder">
          <Spinner size="lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * Video detail — player + metadata. Polls while the video is still processing
 * (see `useVideo`); the dash.js player mounts only once it is `ready`.
 */
export function VideoDetailPage() {
  const { videoKey = '' } = useParams<{ videoKey: string }>()
  const { data: video, isPending, isError, error } = useVideo(videoKey)

  if (isPending) {
    return (
      <div className="page">
        <BackLink />
        <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-9)' }}>
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className="page">
        <BackLink />
        <EmptyState
          icon="film"
          title={notFound ? 'Video not found' : 'Couldn’t load this video'}
          text={
            notFound
              ? 'This video may have been removed, or the link is out of date.'
              : (error as Error).message
          }
          action={
            <Link to="/" className="btn btn--secondary">
              Browse library
            </Link>
          }
        />
      </div>
    )
  }

  const manifestUrl = video.status === 'ready' ? videosApi.manifestUrl(video) : null
  const thumbnailsUrl = video.status === 'ready' ? videosApi.thumbnailsUrl(video) : null

  return (
    <div className="page">
      <BackLink />

      <div className="detail-layout">
        <Suspense fallback={<PlayerFallback />}>
          <PlayerShell
            title={video.title}
            status={video.status}
            manifestUrl={manifestUrl}
            thumbnailsUrl={thumbnailsUrl}
            posterUrl={videosApi.posterUrl(video)}
          />
        </Suspense>
      </div>

      {video.status !== 'ready' && video.status !== 'failed' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <Alert title="Still processing">
            This video is {video.status}. The player will be available once transcoding completes —
            this page updates automatically.
          </Alert>
        </div>
      )}

      <div className="detail-secondary">
        <VideoMeta video={video} />
        <MetadataPanel video={video} />
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/" className="page__link detail-back">
      <Icon name="arrow-left" />
      Back to browse
    </Link>
  )
}
