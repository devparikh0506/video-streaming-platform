import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders a human-readable label for the status', () => {
    render(<StatusBadge status="processing" />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('applies a status-specific modifier class', () => {
    render(<StatusBadge status="failed" />)
    expect(screen.getByText('Failed')).toHaveClass('status-badge--failed')
  })
})
