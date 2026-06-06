'use client'

import { useState } from 'react'
import { VideoPlayer } from '@/components/member/VideoPlayer'

interface Module {
  id: string
  title: string
  duration_seconds: number | null
  sort_order: number
  video_url: string
}

interface ModuleListProps {
  modules: Module[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ModuleList({ modules }: ModuleListProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888888]">Konten sedang disiapkan, segera hadir.</p>
      </div>
    )
  }

  const active = modules[activeIndex]

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-64 xl:w-72 flex-shrink-0">
        <h3 className="text-[#888888] text-xs font-semibold uppercase tracking-wider mb-3 px-1">
          Modul ({modules.length})
        </h3>
        <div className="flex flex-col gap-1">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveIndex(i)}
              aria-pressed={i === activeIndex}
              className={`flex items-start gap-3 p-3 rounded-none text-left transition-all duration-200 w-full ${
                i === activeIndex
                  ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                  : 'hover:bg-[#1A1A1A] border border-transparent'
              }`}
            >
              <span className={`text-xs font-mono mt-0.5 w-5 flex-shrink-0 ${i === activeIndex ? 'text-[#D4AF37]' : 'text-[#555555]'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${i === activeIndex ? 'text-[#F5F5F0] font-medium' : 'text-[#888888]'}`}>
                  {mod.title}
                </p>
                {mod.duration_seconds && (
                  <p className="text-xs text-[#555555] mt-0.5">{formatDuration(mod.duration_seconds)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" role="region" aria-label="Video pemutaran">
        <VideoPlayer videoUrl={active.video_url} title={active.title} />
        <div className="mt-3">
          <p className="text-[#888888] text-xs">Modul {activeIndex + 1} dari {modules.length}</p>
        </div>
      </div>
    </div>
  )
}
