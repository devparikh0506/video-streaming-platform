import createClient from 'openapi-fetch'
import type { paths } from '@/api/schema'
import { config } from '@/lib/config'

/** Error thrown for any non-2xx response or an envelope with `success: false`. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Typed openapi-fetch client. Based at the server origin because the OpenAPI
 * paths already include the `/api` prefix. Every method (GET/POST/DELETE) is
 * type-checked against the spec in `schema.d.ts`.
 */
export const apiClient = createClient<paths>({ baseUrl: config.apiOrigin })

/** The `{ success, data, error }` envelope every endpoint returns. */
interface Envelope<D> {
  success: boolean
  data?: D | null
  error?: string | null
}

interface FetchResult<D> {
  data?: Envelope<D>
  error?: unknown
  response: Response
}

function messageFromError(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'error' in error) {
    const inner = (error as { error?: unknown }).error
    if (typeof inner === 'string') return inner
  }
  return undefined
}

/**
 * Resolve an openapi-fetch call to its inner `data` payload.
 *
 * Centralizes the envelope contract: throws an {@link ApiError} on a transport
 * error, a non-2xx status, `success: false`, or a missing payload — so query
 * functions can simply `return unwrap(apiClient.GET(...))` and hooks get either
 * a value or a thrown error (never a silent `success: false`).
 */
export async function unwrap<D>(call: Promise<FetchResult<D>>): Promise<D> {
  const { data, error, response } = await call

  if (error || !response.ok) {
    const message = messageFromError(error) ?? `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  if (!data || data.success === false || data.data == null) {
    throw new ApiError(data?.error ?? 'The server returned no data.', response.status)
  }

  return data.data
}
