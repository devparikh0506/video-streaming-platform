import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  text?: string
  action?: ReactNode
}

/** Centered placeholder for empty lists, grids, and zero-result states. */
export function EmptyState({ icon = 'film', title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} />
      </span>
      <p className="empty-state__title">{title}</p>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </div>
  )
}
