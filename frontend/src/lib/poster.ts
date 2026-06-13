/**
 * Deterministic poster art derived from a video key.
 *
 * Rather than full-spectrum random gradients (which read as a generated demo),
 * each video maps to one tone from a small, curated palette of deep, low-chroma
 * duotones. The result is cohesive and editorial — a real design-system
 * placeholder until the backend produces poster frames.
 */

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Curated hues (oklch hue angle): slate, ocean, teal, moss, olive, clay, plum, indigo. */
const HUES = [255, 230, 200, 165, 110, 45, 320, 280]

export interface PosterArt {
  /** Ready-to-use CSS gradient for the poster surface. */
  background: string
  /** The hue angle, exposed for accent treatments. */
  hue: number
}

/**
 * A soft, light, low-chroma tint per video — calm enough to read as a real
 * thumbnail placeholder on a light canvas, distinct enough to tell apart.
 */
export function posterArt(key: string): PosterArt {
  const hue = HUES[hash(key) % HUES.length]
  const background = `linear-gradient(150deg,
    oklch(93% 0.03 ${hue}) 0%,
    oklch(89% 0.04 ${hue}) 100%)`
  return { background, hue }
}
