import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DownloadButton } from '@/components/member/DownloadButton'
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('DownloadButton', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://drive.google.com/uc?export=download&id=abc123' }),
    })
    // Component uses window.location.href, not window.open
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' },
    })
  })

  it('renders download button', () => {
    render(<DownloadButton ebookId="abc-123" />)
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument()
  })

  it('calls download API on click', async () => {
    render(<DownloadButton ebookId="abc-123" />)
    await userEvent.click(screen.getByRole('button', { name: /Download PDF/i }))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/ebook/download/abc-123')
    })
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
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
