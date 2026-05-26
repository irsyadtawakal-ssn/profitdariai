import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryFilter } from '@/components/member/CategoryFilter'
import { vi } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/kursus',
}))

describe('CategoryFilter', () => {
  beforeEach(() => mockPush.mockClear())

  it('renders all category pills', () => {
    render(<CategoryFilter />)
    expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bisnis' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Otomasi' })).toBeInTheDocument()
  })

  it('highlights Semua when no activeCategory prop', () => {
    render(<CategoryFilter />)
    expect(screen.getByRole('button', { name: 'Semua' }).className).toContain('bg-[#D4AF37]')
  })

  it('highlights active category', () => {
    render(<CategoryFilter activeCategory="Bisnis" />)
    expect(screen.getByRole('button', { name: 'Bisnis' }).className).toContain('bg-[#D4AF37]')
  })

  it('pushes category param on filter click', async () => {
    render(<CategoryFilter />)
    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    expect(mockPush).toHaveBeenCalledWith('/kursus?category=Bisnis')
  })

  it('removes category param when Semua clicked', async () => {
    render(<CategoryFilter activeCategory="Bisnis" />)
    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(mockPush).toHaveBeenCalledWith('/kursus')
  })
})
