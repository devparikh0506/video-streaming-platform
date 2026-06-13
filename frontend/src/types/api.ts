/**
 * Standard response envelope used by the backend for every endpoint:
 * `{ success, data, error }`. See AGENTS.md "API Response Format".
 */
export interface ApiEnvelope<T> {
  success: boolean
  data: T | null
  error: string | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
