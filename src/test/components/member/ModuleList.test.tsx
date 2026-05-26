import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleList } from '@/components/member/ModuleList'
import { vi } from 'vitest'

const modules = [
  { id: '1', title: 'Pengenalan AI Bisnis', duration_seconds: 480, sort_order: 0, video_url: 'dQw4w9WgXcQ' },
  { id: '2', title: 'Setup Tools Gratis', duration_seconds: 600, sort_order: 1, video_url: 'abc123' },
]

vi.mock('@/components/member/VideoPlayer', () => ({
  VideoPlayer: ({ videoUrl }: { videoUrl: string }) => <div data-testid="video-player">{videoUrl}</div>,
}))

describe('ModuleList', () => {
  it('renders all module titles', () => {
    render(<ModuleList modules={modules} />)
    expect(screen.getByText('Pengenalan AI Bisnis')).toBeInTheDocument()
    expect(screen.getByText('Setup Tools Gratis')).toBeInTheDocument()
  })

  it('shows first module video by default', () => {
    render(<ModuleList modules={modules} />)
    expect(screen.getByTestId('video-player')).toHaveTextContent('dQw4w9WgXcQ')
  })

  it('switches video when module clicked', async () => {
    render(<ModuleList modules={modules} />)
    await userEvent.click(screen.getByRole('button', { name: /Setup Tools Gratis/i }))
    expect(screen.getByTestId('video-player')).toHaveTextContent('abc123')
  })

  it('marks first module as active by default', () => {
    render(<ModuleList modules={modules} />)
    expect(screen.getByRole('button', { name: /Pengenalan AI Bisnis/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Setup Tools Gratis/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders empty state when no modules', () => {
    render(<ModuleList modules={[]} />)
    expect(screen.getByText(/Konten sedang disiapkan/)).toBeInTheDocument()
  })
})
