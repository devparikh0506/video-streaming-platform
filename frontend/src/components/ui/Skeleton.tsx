import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  radius?: string | number
  className?: string
}

/** Shimmering placeholder block for loading states. */
export function Skeleton({ width, height, radius, className }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  }
  return <span className={cx('skeleton', className)} style={style} aria-hidden="true" />
}
