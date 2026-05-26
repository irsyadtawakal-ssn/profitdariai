'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const CATEGORIES = ['Semua', 'Bisnis', 'Freelancing', 'Konten', 'Otomasi', 'Lainnya']

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
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          aria-pressed={active === cat}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-[#D4AF37] text-[#0A0A0A]'
              : 'bg-[#1A1A1A] text-[#888888] hover:text-[#F5F5F0] hover:bg-[#222222]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
