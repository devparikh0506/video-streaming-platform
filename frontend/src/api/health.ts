import { apiClient, unwrap } from '@/api/client'

export const healthApi = {
  check(): Promise<{ status: string }> {
    return unwrap(apiClient.GET('/api/health'))
  },
}
