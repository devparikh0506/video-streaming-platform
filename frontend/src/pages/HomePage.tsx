import { useState } from 'react'
import { useCategories, useVideos } from '@/hooks/useVideos'
import { HeroFeature } from '@/components/video/HeroFeature'
import { VideoGrid } from '@/components/video/VideoGrid'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

const ALL = 'All'

/**
 * Home — an editorial feature followed by a roomy browse grid with a category
 * filter. Reads live, ready-to-stream videos via TanStack Query.
 */
export function HomePage() {
  const [filter, setFilter] = useState<string>(ALL)
  const categoriesQuery = useCategories()
  const videosQuery = useVideos({
    status: 'ready',
    category: filter === ALL ? undefined : filter,
  })

  const items = videosQuery.data?.pages.flatMap((page) => page.items) ?? []
  const showFeature = filter === ALL && items.length > 0
  const featured = showFeature ? items[0] : undefined
  const gridItems = showFeature ? items.slice(1) : items
  const categories = categoriesQuery.data ?? []

  return (
    <div className="page stack--lg">
      {videosQuery.isPending ? (
        <CenteredSpinner />
      ) : videosQuery.isError ? (
        <Alert variant="error" title="Couldn’t load videos">
          {(videosQuery.error as Error).message}
        </Alert>
      ) : (
        <>
          {featured && <HeroFeature video={featured} />}

          <section aria-label="Browse videos">
            <div className="browse-head">
              <h2 className="browse-head__title">Browse the library</h2>
              <div className="chip-row">
                <Chip label={ALL} active={filter === ALL} onClick={() => setFilter(ALL)} />
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    active={filter === category}
                    onClick={() => setFilter(category)}
                  />
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon="compass"
                title={filter === ALL ? 'No videos yet' : `Nothing in ${filter} yet`}
                text="Upload a video from the dashboard and it will appear here once ready."
              />
            ) : gridItems.length === 0 ? (
              <EmptyState icon="film" title="That’s the only one here so far." />
            ) : (
              <>
                <VideoGrid videos={gridItems} />
                {videosQuery.hasNextPage && (
                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <Button
                      variant="secondary"
                      block
                      onClick={() => videosQuery.fetchNextPage()}
                      disabled={videosQuery.isFetchingNextPage}
                    >
                      {videosQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function CenteredSpinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-9)' }}>
      <Spinner size="lg" />
    </div>
  )
}
