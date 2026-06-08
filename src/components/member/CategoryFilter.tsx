'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const CATEGORIES = ['Semua', 'Materi', 'Tools', 'Lainnya']

interface CategoryFilterProps {
  activeCategory?: string
}

export function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleFilter(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'Semua') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const active = activeCategory ?? 'Semua'

  return (
    <div className="flex flex-wrap gap-2 p-1 bg-[#110E07] border border-[#D4AF37]/20 w-fit">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          aria-pressed={active === cat}
          className={`px-5 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 rounded-none ${
            active === cat
              ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)]'
              : 'bg-transparent text-[#888888] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
