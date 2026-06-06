'use client'

import { useState, useEffect } from 'react'
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/youtube'

export type VideoItem = {
  title: string
  url: string
}

interface MateriVideoPlayerProps {
  videos: VideoItem[]
}

export function MateriVideoPlayer({ videos }: MateriVideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!videos.length) return null

  useEffect(() => {
    if (activeIndex >= videos.length) {
      setActiveIndex(Math.max(0, videos.length - 1))
    }
  }, [videos.length, activeIndex])

  const activeVideo = videos[activeIndex]
  const videoId = extractYouTubeId(activeVideo.url)

  if (!videoId) return null

  const embedUrl = getYouTubeEmbedUrl(videoId)

  if (videos.length === 1) {
    return (
      <div>
        <iframe
          src={embedUrl}
          title={activeVideo.title}
          className="w-full aspect-video rounded-none border border-[#D4AF37]/20"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <p className="text-[#555] text-xs mt-3 text-center">{activeVideo.title}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Main player */}
      <iframe
        src={embedUrl}
        title={activeVideo.title}
        className="w-full aspect-video rounded-none border border-[#D4AF37]/20 mb-4"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* Playlist */}
      <div className="flex flex-col gap-2">
        {videos.map((video, index) => (
          <button
            key={video.url}
            onClick={() => setActiveIndex(index)}
            aria-label={`Putar video: ${video.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-left w-full transition-all duration-200 ${
              index === activeIndex
                ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                : 'bg-[#110E07] border border-primary/10 hover:border-[#D4AF37]/45'
            }`}
          >
            <span className={`w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              index === activeIndex
                ? 'bg-[#D4AF37] text-[#0A0A0A]'
                : 'bg-[#1A1A1A] text-[#555]'
            }`}>
              {index === activeIndex ? '▶' : index + 1}
            </span>
            <div className="min-w-0">
              <div className={`text-sm font-semibold truncate ${
                index === activeIndex ? 'text-[#D4AF37]' : 'text-[#888]'
              }`}>
                {video.title}
              </div>
              {index === activeIndex && (
                <div className="text-[10px] text-[#D4AF37]/60 mt-0.5">Sedang diputar</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
