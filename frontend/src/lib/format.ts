/** Small, pure formatting helpers. Unit-tested in `format.test.ts`. */

const KB = 1024
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < KB) return `${bytes} B`
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(KB)), SIZE_UNITS.length - 1)
  const value = bytes / KB ** exponent
  return `${value.toFixed(fractionDigits)} ${SIZE_UNITS[exponent]}`
}

/** Seconds -> "h:mm:ss" or "m:ss". Returns "—" for unknown durations. */
export function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return '—'
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)
  const hours = Math.floor(totalSeconds / 3600)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}
