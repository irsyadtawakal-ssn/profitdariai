import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ModulDialog } from '@/app/(admin)/admin/kursus/[id]/modul/ModulDialog'

vi.mock('@/app/(admin)/admin/kursus/[id]/modul/actions', () => ({
  createModul: vi.fn().mockResolvedValue(undefined),
  updateModul: vi.fn().mockResolvedValue(undefined),
}))

describe('ModulDialog', () => {
  it('renders add form', () => {
    render(<ModulDialog open={true} onClose={vi.fn()} courseId="course-1" />)
    expect(screen.getByText('Tambah Modul')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tambah/i })).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const modul = { id: 'm1', title: 'Intro', video_url: 'https://youtu.be/abc', duration_seconds: 300, sort_order: 1 }
    render(<ModulDialog open={true} onClose={vi.fn()} courseId="course-1" modul={modul} />)
    expect(screen.getByText('Edit Modul')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Intro')).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<ModulDialog open={true} onClose={onClose} courseId="course-1" />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
