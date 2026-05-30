# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign member dashboard ke Dark Premium library feel — Hero Banner berglow gold, Materi Pilihan (featured), Materi Terbaru 3-kolom — dan rename terminologi Ebook→Materi di seluruh UI.

**Architecture:** Tambah kolom `is_featured` ke tabel `ebooks`, buat route `/materi` baru (redirect dari `/ebook`), redesign `dashboard/page.tsx` dengan hero streaming + featured + grid, update sidebar + bottom nav, update middleware matcher.

**Tech Stack:** Next.js 16 App Router, Supabase, pnpm, Tailwind CSS, Lucide React

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/004_add_is_featured.sql` | Create — migrasi kolom `is_featured` |
| `src/lib/cache/content.ts` | Modify — tambah `is_featured` ke select ebooks |
| `src/components/member/MateriCard.tsx` | Create — reskin EbookCard untuk /materi |
| `src/components/member/FeaturedMateri.tsx` | Create — featured card dengan is_featured logic |
| `src/components/member/MemberSidebar.tsx` | Modify — hapus Kursus, Ebook→Materi |
| `src/components/member/MemberBottomNav.tsx` | Modify — hapus Kursus, Ebook→Materi |
| `src/proxy.ts` | Modify — tambah `/materi` ke protected routes + matcher |
| `src/app/(member)/materi/page.tsx` | Create — halaman library materi |
| `src/app/(member)/materi/loading.tsx` | Create — skeleton loading |
| `src/app/(member)/materi/[slug]/page.tsx` | Create — detail materi |
| `src/app/(member)/ebook/page.tsx` | Modify — redirect ke /materi |
| `src/app/(member)/ebook/[slug]/page.tsx` | Modify — redirect ke /materi/[slug] |
| `src/app/(member)/dashboard/page.tsx` | Modify — redesign hero + featured + grid |

---

## Task 1: Database Migration — Kolom `is_featured`

**Files:**
- Create: `supabase/migrations/004_add_is_featured.sql`

- [ ] **Step 1: Buat file migrasi SQL**

```sql
-- supabase/migrations/004_add_is_featured.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
```

- [ ] **Step 2: Jalankan migrasi di Supabase**

Buka Supabase Dashboard → SQL Editor → paste dan run isi file di atas.

Expected: kolom `is_featured` muncul di tabel `ebooks` dengan default `false`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/004_add_is_featured.sql
git commit -m "feat(db): add is_featured column to ebooks"
```

---

## Task 2: Update `getCachedEbooks` — Include `is_featured`

**Files:**
- Modify: `src/lib/cache/content.ts`

- [ ] **Step 1: Update select query untuk include is_featured**

Di `src/lib/cache/content.ts`, ubah baris select ebooks dari:
```ts
.select('id, slug, title, category, cover_url')
```
menjadi:
```ts
.select('id, slug, title, category, cover_url, description, is_featured')
```

File lengkap setelah edit:
```ts
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export const getCachedCourses = unstable_cache(
  async (category?: string) => {
    const supabase = createAdminClient()
    let query = supabase
      .from('courses')
      .select('id, slug, title, category, thumbnail_url, course_modules(count)')
      .eq('is_published', true)
      .order('sort_order')

    if (category) query = query.eq('category', category)

    const { data } = await query
    return data ?? []
  },
  ['courses-published'],
  { revalidate: 60 }
)

export const getCachedEbooks = unstable_cache(
  async (category?: string) => {
    const supabase = createAdminClient()
    let query = supabase
      .from('ebooks')
      .select('id, slug, title, category, cover_url, description, is_featured')
      .eq('is_published', true)
      .order('sort_order')

    if (category) query = query.eq('category', category)

    const { data } = await query
    return data ?? []
  },
  ['ebooks-published'],
  { revalidate: 60 }
)

export const getCachedCourseCounts = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const [{ count: courseCount }, { count: ebookCount }] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('is_published', true),
    ])
    return { courseCount: courseCount ?? 0, ebookCount: ebookCount ?? 0 }
  },
  ['content-counts'],
  { revalidate: 60 }
)
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/cache/content.ts
git commit -m "feat(cache): include is_featured and description in ebooks query"
```

---

## Task 3: Buat `MateriCard` Component

**Files:**
- Create: `src/components/member/MateriCard.tsx`

- [ ] **Step 1: Buat MateriCard**

```tsx
// src/components/member/MateriCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface MateriCardProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
}

export function MateriCard({ slug, title, category, cover_url }: MateriCardProps) {
  return (
    <Link href={`/materi/${slug}`} className="block group">
      <div className="rounded-xl overflow-hidden bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#D4AF37]/30 transition-all hover:-translate-y-0.5 duration-200">
        <div className="aspect-[3/2] bg-[#161616] relative overflow-hidden">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                <rect x="0.5" y="0.5" width="27" height="35" rx="3.5" stroke="#D4AF37" strokeOpacity="0.2"/>
                <rect x="4" y="8" width="14" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
                <rect x="4" y="13" width="20" height="2" rx="1" fill="#D4AF37" fillOpacity="0.15"/>
                <rect x="4" y="18" width="16" height="2" rx="1" fill="#D4AF37" fillOpacity="0.15"/>
                <rect x="4" y="23" width="10" height="2" rx="1" fill="#D4AF37" fillOpacity="0.1"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <Badge variant="gold" className="mb-2 text-[10px]">
            {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-semibold text-sm leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/member/MateriCard.tsx
git commit -m "feat(ui): add MateriCard component"
```

---

## Task 4: Buat `FeaturedMateri` Component

**Files:**
- Create: `src/components/member/FeaturedMateri.tsx`

- [ ] **Step 1: Buat FeaturedMateri**

```tsx
// src/components/member/FeaturedMateri.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface FeaturedMateriProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
  description: string | null
}

export function FeaturedMateri({ slug, title, category, cover_url, description }: FeaturedMateriProps) {
  return (
    <Link href={`/materi/${slug}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#131108] to-[#0F0D06] border border-[#2A2200] hover:border-[#D4AF37] transition-colors p-5 flex gap-5 items-start">
        {/* Left gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20 rounded-l-xl" />

        {/* Cover */}
        <div className="w-20 h-[100px] rounded-lg overflow-hidden bg-[#1A1808] border border-[#2A2200] flex-shrink-0 relative">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="24" height="32" viewBox="0 0 28 36" fill="none">
                <rect x="0.5" y="0.5" width="27" height="35" rx="3.5" stroke="#D4AF37" strokeOpacity="0.3"/>
                <rect x="4" y="8" width="14" height="2" rx="1" fill="#D4AF37" fillOpacity="0.3"/>
                <rect x="4" y="13" width="20" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
                <rect x="4" y="18" width="16" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
              </svg>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* "Pilihan Editor" badge top-right */}
          <span className="absolute top-4 right-5 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
            ★ Pilihan Editor
          </span>

          <Badge variant="gold" className="mb-2 text-[10px]">
            ⭐ {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-bold text-[15px] leading-snug mb-2 pr-24">
            {title}
          </h3>
          {description && (
            <p className="text-[#666] text-xs leading-relaxed mb-4 line-clamp-3">
              {description}
            </p>
          )}
          <span className="inline-block bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold px-4 py-1.5 rounded-md group-hover:bg-[#E5C84A] transition-colors">
            Buka Materi →
          </span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/member/FeaturedMateri.tsx
git commit -m "feat(ui): add FeaturedMateri spotlight component"
```

---

## Task 5: Update Middleware — Tambah `/materi`, Hapus `/kursus`

**Files:**
- Modify: `src/proxy.ts`

- [ ] **Step 1: Update isProtected check dan membership check**

Di `src/proxy.ts`, ubah dua bagian:

**1. Protected routes check** (baris 25-26):
```ts
// SEBELUM:
const isProtected = ['/dashboard', '/kursus', '/ebook', '/profile', '/admin'].some(
  (p) => pathname.startsWith(p)
)

// SESUDAH:
const isProtected = ['/dashboard', '/materi', '/ebook', '/profile', '/admin'].some(
  (p) => pathname.startsWith(p)
)
```

**2. Membership check** (baris 33-34):
```ts
// SEBELUM:
if (user && (pathname.startsWith('/kursus/') || pathname.startsWith('/ebook/'))) {

// SESUDAH:
if (user && (pathname.startsWith('/materi/') || pathname.startsWith('/ebook/'))) {
```

**3. Config matcher** (baris 65-72):
```ts
// SEBELUM:
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kursus/:path*',
    '/ebook/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}

// SESUDAH:
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/materi/:path*',
    '/ebook/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
```

File lengkap `src/proxy.ts` setelah edit:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isProtected = ['/dashboard', '/materi', '/ebook', '/profile', '/admin'].some(
    (p) => pathname.startsWith(p)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname.startsWith('/materi/') || pathname.startsWith('/ebook/'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_expires_at')
      .eq('id', user.id)
      .single()

    const isActive =
      profile?.membership_expires_at &&
      new Date(profile.membership_expires_at) > new Date()

    if (!isActive) {
      return NextResponse.redirect(new URL('/pricing?expired=true', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/materi/:path*',
    '/ebook/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat(middleware): protect /materi route, remove /kursus"
```

---

## Task 6: Update Sidebar dan Bottom Nav

**Files:**
- Modify: `src/components/member/MemberSidebar.tsx`
- Modify: `src/components/member/MemberBottomNav.tsx`

- [ ] **Step 1: Update MemberSidebar — hapus Kursus, ganti Ebook→Materi**

Ganti array NAV di `src/components/member/MemberSidebar.tsx`:
```ts
// SEBELUM:
import { LayoutDashboard, BookOpen, BookMarked, ShoppingBag, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kursus', label: 'Kursus', icon: BookOpen },
  { href: '/ebook', label: 'Ebook', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

// SESUDAH:
import { LayoutDashboard, BookMarked, ShoppingBag, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materi', label: 'Materi', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]
```

- [ ] **Step 2: Update MemberBottomNav — hapus Kursus, ganti Ebook→Materi**

Ganti array NAV di `src/components/member/MemberBottomNav.tsx`:
```ts
// SEBELUM:
import { LayoutDashboard, BookOpen, BookMarked, ShoppingBag, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kursus', label: 'Kursus', icon: BookOpen },
  { href: '/ebook', label: 'Ebook', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

// SESUDAH:
import { LayoutDashboard, BookMarked, ShoppingBag, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materi', label: 'Materi', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/member/MemberSidebar.tsx src/components/member/MemberBottomNav.tsx
git commit -m "feat(nav): remove Kursus, rename Ebook→Materi in sidebar and bottom nav"
```

---

## Task 7: Buat Route `/materi`

**Files:**
- Create: `src/app/(member)/materi/page.tsx`
- Create: `src/app/(member)/materi/loading.tsx`

- [ ] **Step 1: Buat halaman materi**

```tsx
// src/app/(member)/materi/page.tsx
import { Suspense } from 'react'
import { getCachedEbooks } from '@/lib/cache/content'
import { MateriCard } from '@/components/member/MateriCard'
import { CategoryFilter } from '@/components/member/CategoryFilter'

interface MateriPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function MateriPage({ searchParams }: MateriPageProps) {
  const { category } = await searchParams
  const materis = await getCachedEbooks(category)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-1">Library Materi</h1>
        <p className="text-[#888888] text-sm">{materis.length} materi tersedia</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={category} />
        </Suspense>
      </div>

      {materis.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {materis.map((materi) => (
            <MateriCard
              key={materi.id}
              slug={materi.slug}
              title={materi.title}
              category={materi.category}
              cover_url={materi.cover_url}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#888888]">Tidak ada materi di kategori ini.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Buat loading skeleton**

```tsx
// src/app/(member)/materi/loading.tsx
export default function MateriLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-8 w-36 bg-[#1A1A1A] rounded-lg mb-2" />
      <div className="h-4 w-28 bg-[#1A1A1A] rounded mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#1A1A1A] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="aspect-[3/2] bg-[#1A1A1A]" />
            <div className="p-3 space-y-1.5">
              <div className="h-3 w-14 bg-[#1A1A1A] rounded" />
              <div className="h-4 w-full bg-[#1A1A1A] rounded" />
              <div className="h-4 w-2/3 bg-[#1A1A1A] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(member\)/materi/
git commit -m "feat(routes): add /materi page with MateriCard grid"
```

---

## Task 8: Buat Route `/materi/[slug]`

**Files:**
- Create: `src/app/(member)/materi/[slug]/page.tsx`

- [ ] **Step 1: Buat halaman detail materi**

```tsx
// src/app/(member)/materi/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DownloadButton } from '@/components/member/DownloadButton'
import { Badge } from '@/components/ui/badge'

interface MateriDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function MateriDetailPage({ params }: MateriDetailPageProps) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: materi } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, page_count')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!materi) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-56 flex-shrink-0">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#222222]">
            {materi.cover_url ? (
              <img
                src={materi.cover_url}
                alt={materi.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-bold">M</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <Badge variant="gold" className="mb-3">
            {materi.category}
          </Badge>
          <h1 className="text-2xl font-bold text-[#F5F5F0] mb-3">{materi.title}</h1>
          {materi.description && (
            <p className="text-[#888888] text-sm mb-4 leading-relaxed">{materi.description}</p>
          )}
          {materi.page_count && (
            <p className="text-[#555555] text-sm mb-6">{materi.page_count} halaman · PDF</p>
          )}
          <DownloadButton ebookId={materi.id} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(member\)/materi/\[slug\]/
git commit -m "feat(routes): add /materi/[slug] detail page"
```

---

## Task 9: Redirect `/ebook` → `/materi`

**Files:**
- Modify: `src/app/(member)/ebook/page.tsx`
- Modify: `src/app/(member)/ebook/[slug]/page.tsx`

- [ ] **Step 1: Redirect ebook list page**

Ganti seluruh isi `src/app/(member)/ebook/page.tsx` dengan:
```tsx
import { redirect } from 'next/navigation'

interface EbookPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function EbookPage({ searchParams }: EbookPageProps) {
  const { category } = await searchParams
  const target = category ? `/materi?category=${category}` : '/materi'
  redirect(target)
}
```

- [ ] **Step 2: Redirect ebook detail page**

Ganti seluruh isi `src/app/(member)/ebook/[slug]/page.tsx` dengan:
```tsx
import { redirect } from 'next/navigation'

interface EbookDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function EbookDetailPage({ params }: EbookDetailPageProps) {
  const { slug } = await params
  redirect(`/materi/${slug}`)
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(member\)/ebook/
git commit -m "feat(routes): redirect /ebook/* to /materi/* for backward compat"
```

---

## Task 10: Redesign Dashboard Page

**Files:**
- Modify: `src/app/(member)/dashboard/page.tsx`

- [ ] **Step 1: Ganti seluruh isi dashboard/page.tsx**

```tsx
// src/app/(member)/dashboard/page.tsx
import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedEbooks, getCachedCourseCounts } from '@/lib/cache/content'
import { isMembershipActive } from '@/lib/membership'
import { MateriCard } from '@/components/member/MateriCard'
import { FeaturedMateri } from '@/components/member/FeaturedMateri'
import Link from 'next/link'

const QUOTES = [
  'Investasi terbaik adalah investasi pada diri sendiri.',
  'Setiap hari adalah kesempatan untuk belajar sesuatu yang baru.',
  'AI bukan pengganti manusia — AI adalah alat bagi manusia yang mau belajar.',
  'Konsistensi mengalahkan motivasi. Buka satu materi hari ini.',
]

async function MemberHero() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, membership_expires_at')
    .eq('id', user!.id)
    .single()

  const isActive = isMembershipActive({ membership_expires_at: profile?.membership_expires_at ?? null })
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#2E2800] mb-8" style={{
      background: 'linear-gradient(135deg, #161208 0%, #0A0A0A 55%, #100E04 100%)',
    }}>
      {/* Gold glow top-right */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: '#D4AF37', filter: 'blur(60px)', opacity: 0.12 }} />
      {/* Subtle glow bottom-center */}
      <div className="absolute -bottom-6 left-1/3 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: '#D4AF37', filter: 'blur(50px)', opacity: 0.05 }} />

      <div className="relative p-7 md:p-8">
        <p className="text-[#666] text-[10px] font-semibold uppercase tracking-[1.5px] mb-2">
          Selamat datang kembali
        </p>
        <h1 className="text-[28px] md:text-[32px] font-black tracking-tight leading-none mb-2">
          Halo, <span className="text-[#D4AF37]">{profile?.full_name ?? 'Member'}!</span>
        </h1>
        <p className="text-[#555] text-xs italic mb-6">&ldquo;{quote}&rdquo;</p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
            isActive
              ? 'bg-[#D4AF37] text-[#0A0A0A]'
              : 'bg-red-900/30 text-red-400 border border-red-800/40'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isActive ? 'MEMBER AKTIF' : 'EXPIRED'}
          </span>
          <span className="text-[#444] text-xs hidden sm:block">|</span>
          <span className="text-[#888] text-xs">
            Akses ke seluruh materi tersedia
          </span>
        </div>
      </div>
    </div>
  )
}

function MemberHeroSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1E1E1E] bg-[#0E0E0E] p-7 md:p-8 mb-8">
      <div className="h-3 w-40 bg-[#1A1A1A] rounded mb-3" />
      <div className="h-9 w-64 bg-[#1A1A1A] rounded-lg mb-2" />
      <div className="h-3 w-80 bg-[#1A1A1A] rounded mb-6" />
      <div className="flex items-center gap-3">
        <div className="h-7 w-28 bg-[#1A1A1A] rounded-full" />
        <div className="h-3 w-36 bg-[#1A1A1A] rounded" />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [allMateris, { ebookCount }] = await Promise.all([
    getCachedEbooks(),
    getCachedCourseCounts(),
  ])

  const featuredMateri = allMateris.find((m) => m.is_featured) ?? null
  const recentMateris = allMateris.filter((m) => !m.is_featured).slice(0, 3)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero — streams in, user-specific */}
      <Suspense fallback={<MemberHeroSkeleton />}>
        <MemberHero />
      </Suspense>

      {/* Materi Pilihan — hanya tampil jika ada is_featured */}
      {featuredMateri && (
        <section className="mb-10">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-3">
            Materi Pilihan
          </h2>
          <FeaturedMateri
            slug={featuredMateri.slug}
            title={featuredMateri.title}
            category={featuredMateri.category}
            cover_url={featuredMateri.cover_url}
            description={featuredMateri.description ?? null}
          />
        </section>
      )}

      {/* Materi Terbaru */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888]">
            Materi Terbaru
          </h2>
          <Link
            href="/materi"
            className="text-[#D4AF37] text-xs font-semibold hover:underline"
          >
            Lihat Semua ({ebookCount}) →
          </Link>
        </div>
        {recentMateris.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentMateris.map((materi) => (
              <MateriCard
                key={materi.id}
                slug={materi.slug}
                title={materi.title}
                category={materi.category}
                cover_url={materi.cover_url}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#555] text-sm">Konten segera hadir.</p>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: Build succeeds tanpa error. Warnings tentang unused vars boleh ada, tapi tidak boleh ada TypeScript errors atau import errors.

- [ ] **Step 4: Manual test di dev server**

```bash
pnpm dev
```

Buka http://localhost:3000/dashboard dan verifikasi:
1. Hero banner muncul dengan gold glow effect dan nama member
2. Quote muncul di bawah nama
3. Badge "MEMBER AKTIF" solid gold (atau merah kalau expired)
4. Jika ada materi dengan `is_featured = true` di Supabase → "Materi Pilihan" card muncul
5. "Materi Terbaru" grid 3-kolom muncul dengan MateriCard baru
6. Sidebar: hanya Dashboard · Materi · Marketplace · Profil (Kursus hilang)
7. Bottom nav mobile: sama — 4 item
8. Link "Lihat Semua" di materi terbaru → `/materi`
9. Klik salah satu MateriCard → buka `/materi/{slug}`
10. Akses `/ebook` → redirect ke `/materi` ✓

- [ ] **Step 5: Commit**

```bash
git add src/app/\(member\)/dashboard/page.tsx
git commit -m "feat(dashboard): redesign with hero banner, FeaturedMateri, and MateriCard grid"
```

---

## Task 11: Set Featured Materi (Opsional — Manual)

Setelah semua kode di-deploy, set satu materi sebagai featured via Supabase dashboard:

```sql
-- Jalankan di Supabase SQL Editor
-- Ganti 'nama-slug-materi' dengan slug materi yang ingin difeatured
UPDATE ebooks SET is_featured = true WHERE slug = 'nama-slug-materi';

-- Pastikan hanya satu yang featured (optional, bisa banyak tapi hanya yang pertama ditampilkan)
-- UPDATE ebooks SET is_featured = false WHERE slug != 'nama-slug-materi';
```

Setelah set, tunggu 60 detik (cache TTL) atau trigger revalidate via admin panel, lalu refresh `/dashboard` — "Materi Pilihan" card akan muncul.

---

## Verification Checklist

Setelah semua task selesai, test end-to-end:

- [ ] `/dashboard` — hero, featured (jika ada), materi terbaru
- [ ] `/materi` — grid semua materi
- [ ] `/materi/{slug}` — detail materi + download button
- [ ] `/ebook` — redirect ke `/materi`
- [ ] `/ebook/{slug}` — redirect ke `/materi/{slug}`
- [ ] Sidebar desktop: 4 items (tanpa Kursus)
- [ ] Bottom nav mobile: 4 items (tanpa Kursus)
- [ ] Akses tanpa login → redirect ke `/login`
- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm build` → success
