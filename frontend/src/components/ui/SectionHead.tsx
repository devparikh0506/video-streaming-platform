import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

interface SectionHeadProps {
  title: string
  link?: { label: string; to: string }
}

/** Heading row for a content section, with an optional "see all" link. */
export function SectionHead({ title, link }: SectionHeadProps) {
  return (
    <div className="section-head">
      <h2 className="section-head__title">{title}</h2>
      {link && (
        <Link className="section-head__link" to={link.to}>
          {link.label}
          <Icon name="chevron-right" />
        </Link>
      )}
    </div>
  )
}
