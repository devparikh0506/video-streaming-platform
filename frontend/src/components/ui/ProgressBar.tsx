import { cx } from '@/lib/cx'

interface ProgressBarProps {
  /** 0–100. Ignored when `indeterminate` is set. */
  value?: number
  indeterminate?: boolean
  className?: string
}

/** Linear progress indicator used for uploads and processing. */
export function ProgressBar({ value = 0, indeterminate = false, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cx('progress', indeterminate && 'progress--indeterminate', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress__fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}
