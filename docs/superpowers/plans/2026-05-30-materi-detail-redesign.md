# Materi Detail Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/materi/[slug]` halaman detail materi dengan Magazine layout premium — hero card gold-tinted, deskripsi card, dan playlist video YouTube (opsional).

**Architecture:** Tambah kolom `videos JSONB` ke tabel `ebooks`, buat client component `MateriVideoPlayer` untuk playlist state, redesign server component `materi/[slug]/page.tsx` dengan tiga section: hero card, deskripsi, video player.

**Tech Stack:** Next.js 16 App Router, Supabase, Tailwind CSS, `src/lib/youtube.ts` (sudah ada)

---

## File Map

| File | Action | Keterangan |
|---|---|---|
| `supabase/migrations/005_add_videos_to_ebooks.sql` | Create | Tambah kolom `videos JSONB` |
| `src/components/member/MateriVideoPlayer.tsx` | Create | Client component — playlist dengan useState |
| `src/app/(member)/materi/[slug]/page.tsx` | Modify | Redesign full — magazine layout + video |

---

## Task 1: Database Migration — Kolom `videos`

**Files:**
- Create: `supabase/migrations/005_add_videos_to_ebooks.sql`

- [ ] **Step 1: Buat file migrasi SQL**

```sql
-- supabase/migrations/005_add_videos_to_ebooks.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT NULL;
```

- [ ] **Step 2: Jalankan di Supabase**

Buka Supabase Dashboard → SQL Editor → paste dan run.

Expected: kolom `videos` muncul di tabel `ebooks`, type JSONB, default NULL.

Contoh data yang bisa diinput manual untuk test:
```json
[
  { "title": "Pengenalan Materi", "url": "dQw4w9WgXcQ" },
  { "title": "Pembahasan Mendalam", "url": "xvFZjo5PgG0" }
]
```

- [ ] **Step 3: Commit file migrasi**

```bash
git add supabase/migrations/005_add_videos_to_ebooks.sql
git commit -m "feat(db): add videos JSONB column to ebooks"
```

---

## Task 2: Buat `MateriVideoPlayer` Component

**Files:**
- Create: `src/components/member/MateriVideoPlayer.tsx`

- [ ] **Step 1: Buat file component**

```tsx
// src/components/member/MateriVideoPlayer.tsx
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
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors dari file ini.

- [ ] **Step 3: Commit**

```bash
git add src/components/member/MateriVideoPlayer.tsx
git commit -m "feat(ui): add MateriVideoPlayer playlist component"
```

---

## Task 3: Redesign `materi/[slug]/page.tsx`

**Files:**
- Modify: `src/app/(member)/materi/[slug]/page.tsx`

- [ ] **Step 1: Ganti seluruh isi file**

```tsx
// src/app/(member)/materi/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DownloadButton } from '@/components/member/DownloadButton'
import { MateriVideoPlayer, type VideoItem } from '@/components/member/MateriVideoPlayer'
import { Badge } from '@/components/ui/badge'

interface MateriDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function MateriDetailPage({ params }: MateriDetailPageProps) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: materi } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, page_count, videos')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!materi) notFound()

  const videos = (materi.videos as VideoItem[] | null) ?? null

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ① Hero Card */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[#2A2200] p-6 flex flex-col md:flex-row gap-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #161208 0%, #0F0D04 100%)' }}
      >
        {/* Gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.06) 0%, transparent 60%)' }}
        />

        {/* Cover */}
        <div className="relative flex-shrink-0 self-center md:self-start">
          <div
            className="w-28 md:w-[120px] aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1808] to-[#2A2208] border border-[#2E2400]"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1)' }}
          >
            {materi.cover_url ? (
              <img
                src={materi.cover_url}
                alt={materi.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-black opacity-40">M</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="relative flex-1">
          <Badge variant="gold" className="mb-3">{materi.category}</Badge>
          <h1 className="text-[22px] font-black tracking-tight leading-tight text-[#F5F5F0] mb-3">
            {materi.title}
          </h1>
          {materi.page_count && (
            <p className="text-[#555] text-sm mb-5">{materi.page_count} halaman · PDF</p>
          )}
          <div className="md:max-w-xs">
            <DownloadButton ebookId={materi.id} />
          </div>
        </div>
      </div>

      {/* ② Deskripsi */}
      {materi.description && (
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
            Tentang Materi
          </p>
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
            <p className="text-[#999] text-sm leading-relaxed">{materi.description}</p>
          </div>
        </section>
      )}

      {/* ③ Video */}
      {videos && videos.length > 0 && (
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
            Video Penjelasan
          </p>
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
            <MateriVideoPlayer videos={videos} />
          </div>
        </section>
      )}

    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors. Kalau ada error tentang `videos` column tidak dikenal di Supabase types (karena migrasi belum dijalankan), itu acceptable — note sebagai DONE_WITH_CONCERNS.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: Build sukses. Verifikasi tidak ada error di `materi/[slug]/page.tsx`.

- [ ] **Step 4: Manual test di dev server**

```bash
pnpm dev
```

Buka http://localhost:3000/materi/{slug-materi-yang-ada} dan verifikasi:
1. Hero card muncul dengan gold gradient background
2. Cover buku tampil (atau placeholder "M" kalau tidak ada cover_url)
3. Judul bold besar, badge kategori gold
4. Halaman · PDF info muncul (kalau ada page_count)
5. Download button terlihat jelas
6. Deskripsi tampil dalam card "TENTANG MATERI" (kalau ada description)
7. Section video tidak muncul (karena videos = null untuk materi yang belum punya video)

Untuk test video player:
- Buka Supabase → tabel ebooks → edit salah satu row
- Set kolom `videos` ke: `[{"title": "Test Video", "url": "dQw4w9WgXcQ"}]`
- Refresh halaman → section "VIDEO PENJELASAN" muncul dengan iframe YouTube

Untuk test playlist (multiple video):
- Set `videos` ke: `[{"title": "Video 1", "url": "dQw4w9WgXcQ"}, {"title": "Video 2", "url": "xvFZjo5PgG0"}]`
- Refresh → player + playlist list muncul
- Klik item kedua → player berganti video, badge "Sedang diputar" pindah

- [ ] **Step 5: Commit**

```bash
git add src/app/\(member\)/materi/\[slug\]/page.tsx
git commit -m "feat(materi): redesign detail page — magazine layout + playlist video"
```

---

## Verification Checklist

- [ ] `/materi/{slug}` — hero card tampil dengan gold gradient
- [ ] Cover image muncul atau fallback "M"
- [ ] Deskripsi conditional (tidak muncul kalau null)
- [ ] Video section tidak muncul kalau `videos` null/kosong
- [ ] Single video → langsung iframe embed
- [ ] Multiple video → player + playlist, klik ganti video
- [ ] `pnpm typecheck` → 0 errors (atau hanya error DB column yang expected)
- [ ] `pnpm build` → success
