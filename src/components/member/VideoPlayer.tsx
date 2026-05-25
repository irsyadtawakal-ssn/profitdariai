'use client'

import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/youtube'

interface VideoPlayerProps {
  videoUrl: string
  title?: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoId = extractYouTubeId(videoUrl)

  if (!videoId) {
    return (
      <div className="w-full aspect-video rounded-lg bg-[#1A1A1A] flex items-center justify-center">
        <p className="text-[#888888] text-sm">Video tidak tersedia</p>
      </div>
    )
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title={title ?? 'Video kursus'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
