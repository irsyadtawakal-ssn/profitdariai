export default function MateriLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-8 w-36 bg-[#1A1A1A] rounded-lg mb-2" />
      <div className="h-4 w-28 bg-[#1A1A1A] rounded mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#1A1A1A] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="aspect-[3/2] bg-[#1A1A1A]" />
            <div className="p-3 space-y-1.5">
              <div className="h-3 w-14 bg-[#1A1A1A] rounded" />
              <div className="h-4 w-full bg-[#1A1A1A] rounded" />
              <div className="h-4 w-2/3 bg-[#1A1A1A] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
