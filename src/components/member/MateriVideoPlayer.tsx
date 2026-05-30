'use client'

import { useState } from 'react'
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
          className="w-full aspect-video rounded-lg border border-[#1E1E1E]"
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
        className="w-full aspect-video rounded-lg border border-[#1E1E1E] mb-4"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* Playlist */}
      <div className="flex flex-col gap-2">
        {videos.map((video, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors ${
              index === activeIndex
                ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                : 'bg-[#111] border border-[#1E1E1E] hover:border-[#2A2A2A]'
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
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
