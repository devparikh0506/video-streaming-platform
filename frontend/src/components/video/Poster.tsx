import { useState, type ReactNode } from 'react'
import { posterArt } from '@/lib/poster'
import { formatDuration } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'

interface PosterProps {
  videoKey: string
  title: string
  durationSeconds?: number | null
  /** Real poster image URL; falls back to the duotone placeholder when absent or broken. */
  posterUrl?: string | null
  /** Show the hover play affordance. */
  showPlay?: boolean
  /** Slot for an overlay (e.g. a StatusBadge) in the top-left. */
  badge?: ReactNode
}

/**
 * Poster surface: the real poster image when available, otherwise a cohesive
 * duotone "film frame" placeholder. A 404/broken image (e.g. an older video
 * whose pipeline produced no assets) transparently falls back to the placeholder.
 */
export function Poster({
  videoKey,
  title,
  durationSeconds,
  posterUrl,
  showPlay = true,
  badge,
}: PosterProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const useImage = Boolean(posterUrl) && !imageFailed
  const art = posterArt(videoKey)

  return (
    <div className="poster" role="img" aria-label={title}>
      {useImage ? (
        <img
          className="poster__img"
          src={posterUrl ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="poster__art" style={{ background: art.background }}>
          <span className="poster__watermark">
            <Icon name="film" size={44} />
          </span>
          <span className="poster__sheen" />
        </div>
      )}
      {badge && <div className="poster__badge">{badge}</div>}
      {showPlay && (
        <span className="poster__play">
          <Icon name="play" />
        </span>
      )}
      {durationSeconds != null && durationSeconds > 0 && (
        <span className="poster__duration">{formatDuration(durationSeconds)}</span>
      )}
    </div>
  )
}
