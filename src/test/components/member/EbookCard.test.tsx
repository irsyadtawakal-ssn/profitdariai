import { render, screen } from '@testing-library/react'
import { EbookCard } from '@/components/member/EbookCard'
import { vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('EbookCard', () => {
  const props = {
    slug: 'prompt-bank',
    title: 'Prompt Bank Indonesia: 500+ Prompt Cuan',
    category: 'Tools',
    cover_url: null,
  }

  it('renders title and category', () => {
    render(<EbookCard {...props} />)
    expect(screen.getByText('Prompt Bank Indonesia: 500+ Prompt Cuan')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
  })

  it('links to /ebook/[slug]', () => {
    render(<EbookCard {...props} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ebook/prompt-bank')
  })

  it('renders cover img when provided', () => {
    render(<EbookCard {...props} cover_url="https://example.com/cover.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })
})
