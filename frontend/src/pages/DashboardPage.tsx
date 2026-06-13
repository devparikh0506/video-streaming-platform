import { useVideos, useCategories } from '@/hooks/useVideos'
import { useUpload } from '@/hooks/useUpload'
import { useDeleteVideo } from '@/hooks/useVideoMutations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatTiles } from '@/components/upload/StatTiles'
import { UploadDropzone } from '@/components/upload/UploadDropzone'
import { ActiveUploadRow } from '@/components/upload/ActiveUploadRow'
import { VideoRow } from '@/components/upload/VideoRow'

/**
 * Dashboard — upload videos (S3 multipart) and track the library as items
 * transcode through to `ready` / `failed`. Reads live data via TanStack Query.
 */
export function DashboardPage() {
  const videosQuery = useVideos()
  const categoriesQuery = useCategories()
  const { uploads, start, cancel, dismiss } = useUpload()
  const deleteVideo = useDeleteVideo()

  const videos = videosQuery.data?.pages.flatMap((page) => page.items) ?? []
  const activeCount = uploads.filter(
    (u) => u.state === 'uploading' || u.state === 'completing',
  ).length

  return (
    <div className="page">
      <PageHeader
        eyebrow="Studio"
        title="Dashboard"
        subtitle="Upload large videos and watch them transcode into the streaming ladder."
      />

      <StatTiles videos={videos} uploadingCount={activeCount} />

      <div className="dashboard-grid">
        <section className="stack" aria-label="Uploads and library">
          {uploads.length > 0 && (
            <div className="stack">
              <h2 className="section-head__title">Uploading now</h2>
              <div className="job-list">
                {uploads.map((upload) => (
                  <ActiveUploadRow
                    key={upload.id}
                    upload={upload}
                    onCancel={cancel}
                    onDismiss={dismiss}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="stack">
            <h2 className="section-head__title">Library</h2>

            {videosQuery.isPending ? (
              <div className="job-list" aria-busy="true">
                <CenteredSpinner />
              </div>
            ) : videosQuery.isError ? (
              <Alert variant="error" title="Couldn’t load videos">
                {(videosQuery.error as Error).message}
              </Alert>
            ) : videos.length === 0 ? (
              <EmptyState
                icon="upload"
                title="No videos yet"
                text="Upload your first video and it will appear here with live transcoding status."
              />
            ) : (
              <>
                <div className="job-list">
                  {videos.map((video) => (
                    <VideoRow
                      key={video.key}
                      video={video}
                      onDelete={(key) => deleteVideo.mutate(key)}
                      deleting={deleteVideo.isPending && deleteVideo.variables === video.key}
                    />
                  ))}
                </div>
                {videosQuery.hasNextPage && (
                  <Button
                    variant="secondary"
                    block
                    onClick={() => videosQuery.fetchNextPage()}
                    disabled={videosQuery.isFetchingNextPage}
                  >
                    {videosQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </Button>
                )}
              </>
            )}
          </div>
        </section>

        <Card variant="raised" pad aria-label="New upload">
          <h2 className="section-head__title" style={{ marginBottom: '0.25rem' }}>
            New upload
          </h2>
          <p className="dropzone__text" style={{ marginBottom: '1rem' }}>
            Add a video to the library.
          </p>
          <UploadDropzone categories={categoriesQuery.data ?? []} onStart={start} />
        </Card>
      </div>
    </div>
  )
}

function CenteredSpinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-7)' }}>
      <Spinner size="lg" />
    </div>
  )
}
