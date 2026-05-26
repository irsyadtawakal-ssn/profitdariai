import { render, screen } from '@testing-library/react'
import { CourseCard } from '@/components/member/CourseCard'
import { vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CourseCard', () => {
  const props = {
    slug: 'ai-bisnis-101',
    title: 'AI Bisnis 101: Cuan dari ChatGPT',
    category: 'Bisnis',
    thumbnail_url: null,
    moduleCount: 5,
  }

  it('renders title, category, module count', () => {
    render(<CourseCard {...props} />)
    expect(screen.getByText('AI Bisnis 101: Cuan dari ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Bisnis')).toBeInTheDocument()
    expect(screen.getByText('5 modul')).toBeInTheDocument()
  })

  it('links to /kursus/[slug]', () => {
    render(<CourseCard {...props} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/kursus/ai-bisnis-101')
  })

  it('renders thumbnail img when provided', () => {
    render(<CourseCard {...props} thumbnail_url="https://example.com/thumb.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/thumb.jpg')
  })
})
