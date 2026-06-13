import type { VideoSummary } from '@/types/video'
import { Icon, type IconName } from '@/components/ui/Icon'

interface Tile {
  label: string
  value: number
  icon: IconName
  accent?: boolean
}

interface StatTilesProps {
  videos: VideoSummary[]
  /** In-flight client-side uploads, not yet reflected in the library list. */
  uploadingCount: number
}

/** Summary tiles above the job feed: counts by lifecycle stage. */
export function StatTiles({ videos, uploadingCount }: StatTilesProps) {
  const count = (predicate: (v: VideoSummary) => boolean) => videos.filter(predicate).length
  const processing = count((v) => v.status === 'processing' || v.status === 'queued')

  const tiles: Tile[] = [
    { label: 'Library', value: videos.length, icon: 'film' },
    { label: 'In progress', value: processing + uploadingCount, icon: 'zap', accent: true },
    { label: 'Ready', value: count((v) => v.status === 'ready'), icon: 'check' },
    { label: 'Failed', value: count((v) => v.status === 'failed'), icon: 'alert' },
  ]

  return (
    <div className="stat-row">
      {tiles.map((tile) => (
        <div key={tile.label} className={`stat${tile.accent ? ' stat--accent' : ''}`}>
          <span className="stat__label">
            <Icon name={tile.icon} />
            {tile.label}
          </span>
          <span className="stat__value">{tile.value}</span>
        </div>
      ))}
    </div>
  )
}
