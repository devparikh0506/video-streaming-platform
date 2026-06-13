import { describe, expect, it } from 'vitest'
import { formatBytes, formatDuration } from './format'

describe('formatBytes', () => {
  it('renders bytes below 1KB without a decimal unit', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('renders kilobytes with one fraction digit', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('renders megabytes', () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('returns a dash for invalid input', () => {
    expect(formatBytes(-1)).toBe('—')
  })
})

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(95)).toBe('1:35')
  })

  it('formats durations over an hour as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  it('returns a dash for unknown durations', () => {
    expect(formatDuration(null)).toBe('—')
  })
})
