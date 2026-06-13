import type { VideoSummary } from '@/types/video'
import { VideoCard } from '@/components/video/VideoCard'

/** Responsive grid of video cards. */
export function VideoGrid({ videos }: { videos: VideoSummary[] }) {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.key} video={video} />
      ))}
    </div>
  )
}
