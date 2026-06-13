import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface TagProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'cool'
  className?: string
}

/** Small inline chip for categories, resolutions, and labels. */
export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span className={cx('tag', variant !== 'default' && `tag--${variant}`, className)}>
      {children}
    </span>
  )
}
