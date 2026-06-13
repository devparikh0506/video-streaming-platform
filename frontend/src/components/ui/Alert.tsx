import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '@/components/ui/Icon'

interface AlertProps {
  variant?: 'info' | 'error'
  title?: string
  children: ReactNode
}

const ICON: Record<NonNullable<AlertProps['variant']>, IconName> = {
  info: 'info',
  error: 'alert',
}

/** Inline contextual message — info or error. */
export function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div
      className={cx('alert', `alert--${variant}`)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className="alert__icon">
        <Icon name={ICON[variant]} />
      </span>
      <div>
        {title && <p className="alert__title">{title}</p>}
        <p className="alert__text">{children}</p>
      </div>
    </div>
  )
}
