import { cx } from '@/lib/cx'

interface SpinnerProps {
  size?: 'md' | 'lg'
  label?: string
  className?: string
}

/** Indeterminate loading spinner. */
export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span
      className={cx('spinner', size === 'lg' && 'spinner--lg', className)}
      role="status"
      aria-label={label}
    />
  )
}
