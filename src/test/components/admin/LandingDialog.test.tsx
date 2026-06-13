import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingDialog } from '@/app/(admin)/admin/landing/LandingDialog'

vi.mock('@/app/(admin)/admin/landing/actions', () => ({
  createLandingPage: vi.fn(),
  updateLandingPage: vi.fn(),
}))

describe('LandingDialog', () => {
  it('auto-generate slug dari judul saat mode tambah', () => {
    render(<LandingDialog open onClose={() => {}} />)
    const title = screen.getByLabelText('Judul') as HTMLInputElement
    fireEvent.change(title, { target: { value: 'Cuan Dari AI' } })
    const slug = screen.getByLabelText('Slug') as HTMLInputElement
    expect(slug.value).toBe('cuan-dari-ai')
  })

  it('menampilkan nilai awal saat mode edit', () => {
    render(
      <LandingDialog
        open
        onClose={() => {}}
        landing={{ id: '1', slug: 'promo', title: 'Promo', html: '<h1>Hi</h1>', published: true }}
      />,
    )
    expect((screen.getByLabelText('Slug') as HTMLInputElement).value).toBe('promo')
    expect((screen.getByLabelText('Kode HTML') as HTMLTextAreaElement).value).toBe('<h1>Hi</h1>')
  })
})
