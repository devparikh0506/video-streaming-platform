import type { ActiveUpload } from '@/hooks/useUpload'
import { formatBytes } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { IconButton } from '@/components/ui/IconButton'

const STATE_LABEL: Record<ActiveUpload['state'], string> = {
  uploading: 'Uploading…',
  completing: 'Finalizing…',
  done: 'Uploaded',
  error: 'Upload failed',
  canceled: 'Canceled',
}

interface ActiveUploadRowProps {
  upload: ActiveUpload
  onCancel: (id: string) => void
  onDismiss: (id: string) => void
}

/** A client-side upload in flight: progress, state, and cancel/dismiss. */
export function ActiveUploadRow({ upload, onCancel, onDismiss }: ActiveUploadRowProps) {
  const inFlight = upload.state === 'uploading' || upload.state === 'completing'
  const isFailed = upload.state === 'error'

  return (
    <article className={`job${isFailed ? ' job--failed' : ''}`}>
      <div className="job__thumb" style={{ background: 'var(--color-subtle)' }} />

      <div className="job__main">
        <span className="job__title">{upload.title || upload.filename}</span>
        <span className="job__sub">
          <span>{upload.category}</span>
          <span className="job__sub-dot" />
          <span>{formatBytes(upload.size)}</span>
          <span className="job__sub-dot" />
          <span>{STATE_LABEL[upload.state]}</span>
        </span>

        {inFlight && (
          <div className="job__progress-wrap">
            <ProgressBar value={upload.percent} indeterminate={upload.state === 'completing'} />
            {upload.state === 'uploading' && (
              <span className="job__progress-pct">{upload.percent}%</span>
            )}
          </div>
        )}

        {isFailed && upload.error && (
          <p className="job__error">
            <Icon name="alert" />
            {upload.error}
          </p>
        )}
      </div>

      <div className="job__aside">
        {inFlight ? (
          <IconButton icon="close" label="Cancel upload" onClick={() => onCancel(upload.id)} />
        ) : (
          <IconButton icon="close" label="Dismiss" onClick={() => onDismiss(upload.id)} />
        )}
      </div>
    </article>
  )
}
