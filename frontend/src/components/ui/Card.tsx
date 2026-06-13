import type { HTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'glass'
  pad?: boolean
}

/** Surface container with optional elevation/glass treatment and padding. */
export function Card({
  variant = 'default',
  pad = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        'card',
        variant !== 'default' && `card--${variant}`,
        pad && 'card--pad',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
