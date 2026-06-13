import type { Video } from '@/types/video'
import { formatBytes, formatDuration } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'

function formatDate(iso: string): string {
  const [date] = iso.split('T')
  return date ?? iso
}

interface Row {
  label: string
  value: string
}

/** Technical metadata for a video — mirrors the backend metadata. */
export function MetadataPanel({ video }: { video: Video }) {
  const rows: Row[] = [
    { label: 'Video key', value: video.key },
    { label: 'Original file', value: video.originalFilename },
    { label: 'Size', value: formatBytes(video.size) },
    { label: 'Duration', value: formatDuration(video.durationSeconds) },
    { label: 'Resolutions', value: video.resolutions.join(', ') || '—' },
    { label: 'Uploaded', value: formatDate(video.createdAt) },
  ]

  return (
    <aside className="card card--raised card--pad">
      <div className="meta-panel__head">
        <Icon name="layers" />
        <strong>Details</strong>
      </div>
      <dl className="meta-panel__dl">
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'contents' }}>
            <dt className="meta-panel__dt">{row.label}</dt>
            <dd className="meta-panel__dd mono">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
