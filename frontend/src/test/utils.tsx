import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/queryClient'

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

/** `render` wrapped in the app's providers, for component/integration tests. */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
