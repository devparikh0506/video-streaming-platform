import { cx } from '@/lib/cx'

interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

/** Selectable filter chip (e.g. category filters). */
export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={cx('chip', active && 'chip--active')}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
