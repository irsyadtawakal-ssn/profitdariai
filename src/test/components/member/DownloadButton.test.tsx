import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DownloadButton } from '@/components/member/DownloadButton'
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch
const mockWindowOpen = vi.fn()
global.window.open = mockWindowOpen

describe('DownloadButton', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://supabase.co/storage/signed/ebook.pdf' }),
    })
    mockWindowOpen.mockClear()
  })

  it('renders download button', () => {
    render(<DownloadButton ebookId="abc-123" />)
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument()
  })

  it('calls download API and opens signed URL', async () => {
    render(<DownloadButton ebookId="abc-123" />)
    await userEvent.click(screen.getByRole('button', { name: /Download PDF/i }))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/ebook/download/abc-123')
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://supabase.co/storage/signed/ebook.pdf',
        '_blank'
      )
    })
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Membership required' }),
    })
    render(<DownloadButton ebookId="abc-123" />)
    await userEvent.click(screen.getByRole('button', { name: /Download PDF/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows fallback error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('network'))
    render(<DownloadButton ebookId="abc-123" />)
    await userEvent.click(screen.getByRole('button', { name: /Download PDF/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
