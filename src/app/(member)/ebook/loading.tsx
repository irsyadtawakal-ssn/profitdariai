export default function EbookLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-8 w-32 bg-[#1A1A1A] rounded-lg mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#1A1A1A] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
            <div className="aspect-[3/4] bg-[#1A1A1A]" />
            <div className="p-3 space-y-1.5">
              <div className="h-4 w-14 bg-[#1A1A1A] rounded" />
              <div className="h-3 w-full bg-[#1A1A1A] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
