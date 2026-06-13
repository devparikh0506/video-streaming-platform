import type { SVGProps } from 'react'

export type IconName =
  | 'play'
  | 'pause'
  | 'upload'
  | 'search'
  | 'film'
  | 'check'
  | 'alert'
  | 'clock'
  | 'close'
  | 'chevron-right'
  | 'chevron-down'
  | 'settings'
  | 'maximize'
  | 'volume'
  | 'retry'
  | 'layers'
  | 'sparkles'
  | 'menu'
  | 'arrow-left'
  | 'plus'
  | 'info'
  | 'grid'
  | 'calendar'
  | 'drive'
  | 'zap'
  | 'trash'
  | 'compass'
  | 'rewind'
  | 'forward'
  | 'rotate-ccw'
  | 'rotate-cw'

/** Stroke-based icon paths (lucide-style), 24×24 viewBox, currentColor. */
const STROKE_PATHS: Partial<Record<IconName, string>> = {
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
  film: 'M3 4h18v16H3z M7 4v16 M17 4v16 M3 9h4 M17 9h4 M3 15h4 M17 15h4',
  check: 'M20 6 9 17l-5-5',
  alert:
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z M12 9v4 M12 17h.01',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
  close: 'M18 6 6 18 M6 6l12 12',
  'chevron-right': 'm9 6 6 6-6 6',
  'chevron-down': 'm6 9 6 6 6-6',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9 2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5 2 2 0 1 1 4 0 1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.6 1Z',
  maximize:
    'M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3',
  volume: 'M11 5 6 9H2v6h4l5 4V5Z M15.5 8.5a5 5 0 0 1 0 7 M19 5a9 9 0 0 1 0 14',
  retry: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
  layers: 'm12 2 9 5-9 5-9-5 9-5Z M3 12l9 5 9-5 M3 17l9 5 9-5',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z M19 3v4 M21 5h-4',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  'arrow-left': 'm12 19-7-7 7-7 M19 12H5',
  plus: 'M12 5v14 M5 12h14',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 16v-4 M12 8h.01',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  calendar:
    'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  drive: 'M22 12H2 M5.5 6h13l3.5 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4l3.5-6Z M6 16h.01 M10 16h.01',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  trash: 'M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z m4.2-14.2-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z',
  'rotate-ccw': 'M3 2v6h6 M21 12A9 9 0 0 0 6 5.3L3 8',
  'rotate-cw': 'M21 2v6h-6 M3 12A9 9 0 0 1 18 5.3L21 8',
}

/** Solid icons rendered with fill rather than stroke. */
const FILL_PATHS: Partial<Record<IconName, string>> = {
  play: 'M8 5v14l11-7L8 5Z',
  pause: 'M6 4h4v16H6z M14 4h4v16h-4z',
  rewind: 'M11 19V5l-9 7 9 7Z M22 19V5l-9 7 9 7Z',
  forward: 'M13 5v14l9-7-9-7Z M2 5v14l9-7-9-7Z',
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  /**
   * Explicit pixel size. When omitted, the icon renders at a 20px base via the
   * `width`/`height` attributes, which component CSS can override (CSS wins over
   * presentation attributes). When provided, the size is forced via inline style.
   */
  size?: number
}

export function Icon({ name, size, ...rest }: IconProps) {
  const fill = FILL_PATHS[name]
  const stroke = STROKE_PATHS[name]
  const base = size ?? 20

  return (
    <svg
      viewBox="0 0 24 24"
      width={base}
      height={base}
      style={size ? { width: size, height: size } : undefined}
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {(fill ?? stroke ?? '').split(' M').map((segment, index) => (
        <path key={index} d={index === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  )
}
