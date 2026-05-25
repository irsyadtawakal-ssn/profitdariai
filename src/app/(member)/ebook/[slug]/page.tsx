export default function EbookDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-[#F5F5F0]">{params.slug}</h1>
    </main>
  )
}
