import { redirect } from 'next/navigation'

interface EbookDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function EbookDetailPage({ params }: EbookDetailPageProps) {
  const { slug } = await params
  redirect(`/materi/${slug}`)
}
