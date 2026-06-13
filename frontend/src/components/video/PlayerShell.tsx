import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { MediaPlayer, MediaProvider, Poster, isDASHProvider } from '@vidstack/react'
import type { MediaProviderAdapter } from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import type { VideoStatus } from '@/types/video'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'

interface PlayerShellProps {
  title: string
  status: VideoStatus
  /** DASH manifest URL; null until the video is `ready`. */
  manifestUrl: string | null
  /** WebVTT sprite-thumbnail index for seek-bar scrub previews (optional). */
  thumbnailsUrl?: string | null
  /** Poster image shown before playback begins (optional). */
  posterUrl?: string | null
}

const STATUS_MESSAGE: Partial<Record<VideoStatus, string>> = {
  uploading: 'This video is still uploading.',
  queued: 'Queued for transcoding…',
  processing: 'Transcoding into the streaming ladder…',
  failed: 'This video failed to process.',
}

/** Bundle dash.js locally (code-split) instead of letting Vidstack CDN-load it. */
function onProviderChange(provider: MediaProviderAdapter | null) {
  if (isDASHProvider(provider)) {
    provider.library = () => import('dashjs')
  }
}

/**
 * MPEG-DASH player built on Vidstack — a production-grade React player library.
 * Its Default Video Layout supplies the full UI (controls, seek bar with VTT
 * scrub-thumbnail previews, quality/Auto menu, gestures, keyboard, PiP,
 * fullscreen). DASH is played via a locally-bundled dash.js, loaded lazily.
 * Before the video is `ready`, a status placeholder is shown on a dark stage.
 */
export function PlayerShell({
  title,
  status,
  manifestUrl,
  thumbnailsUrl,
  posterUrl,
}: PlayerShellProps) {
  if (!manifestUrl) {
    return (
      <div className="player">
        <div className="player__stage">
          <div className="player__placeholder">
            {status === 'failed' ? <Icon name="alert" size={40} /> : <Spinner size="lg" />}
            <span className="player__hint">{STATUS_MESSAGE[status] ?? 'Preparing video…'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MediaPlayer
      className="vds-player"
      title={title}
      src={{ src: manifestUrl, type: 'application/dash+xml' }}
      poster={posterUrl ?? undefined}
      crossOrigin
      playsInline
      aspectRatio="16/9"
      onProviderChange={onProviderChange}
    >
      <MediaProvider>{posterUrl && <Poster className="vds-poster" alt={title} />}</MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={thumbnailsUrl ?? undefined} />
    </MediaPlayer>
  )
}
