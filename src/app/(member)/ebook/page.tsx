import { redirect } from 'next/navigation'

interface EbookPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function EbookPage({ searchParams }: EbookPageProps) {
  const { category } = await searchParams
  const target = category ? `/materi?category=${category}` : '/materi'
  redirect(target)
}
