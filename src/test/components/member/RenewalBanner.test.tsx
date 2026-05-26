import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RenewalBanner } from '@/components/member/RenewalBanner'
import { vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const DAY_MS = 1000 * 60 * 60 * 24

describe('RenewalBanner', () => {
  beforeEach(() => sessionStorage.clear())

  it('renders when expiry is 7 days away', async () => {
    const expiresAt = new Date(Date.now() + 7 * DAY_MS).toISOString()
    render(<RenewalBanner expiresAt={expiresAt} />)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/7 hari/)).toBeInTheDocument()
  })

  it('does not render when expiry is 20 days away', () => {
    const expiresAt = new Date(Date.now() + 20 * DAY_MS).toISOString()
    render(<RenewalBanner expiresAt={expiresAt} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('dismisses and saves to sessionStorage on X click', async () => {
    const expiresAt = new Date(Date.now() + 5 * DAY_MS).toISOString()
    render(<RenewalBanner expiresAt={expiresAt} />)
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: /tutup/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('renewal-banner-dismissed')).toBe('true')
  })

  it('stays hidden if already dismissed this session', () => {
    sessionStorage.setItem('renewal-banner-dismissed', 'true')
    const expiresAt = new Date(Date.now() + 5 * DAY_MS).toISOString()
    render(<RenewalBanner expiresAt={expiresAt} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
