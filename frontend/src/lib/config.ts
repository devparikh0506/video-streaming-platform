/**
 * Centralized, validated runtime configuration.
 *
 * Fails fast at module load if a required env var is missing, so
 * misconfiguration surfaces immediately instead of as a confusing runtime
 * fetch error deep in the app.
 */

function requireEnv(name: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[name] ?? fallback
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` + `Copy .env.example to .env and set it.`,
    )
  }
  return value
}

/** e.g. "http://localhost:8000/api" — the documented API base, including `/api`. */
const apiBaseUrl = requireEnv('VITE_API_BASE_URL', 'http://localhost:8000/api').replace(/\/$/, '')

export const config = {
  /** Full API base including the `/api` prefix. Used to build media URLs. */
  apiBaseUrl,
  /**
   * Server origin without the `/api` suffix. The OpenAPI paths already carry
   * `/api/...`, so the typed client is based at the origin.
   */
  apiOrigin: apiBaseUrl.replace(/\/api$/, ''),
} as const

export type AppConfig = typeof config
