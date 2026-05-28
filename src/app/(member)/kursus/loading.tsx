export default function KursusLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-[#1A1A1A] rounded-lg mb-6" />
      {/* Category filter skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#1A1A1A] rounded-full" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
            <div className="aspect-video bg-[#1A1A1A]" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-16 bg-[#1A1A1A] rounded" />
              <div className="h-4 w-full bg-[#1A1A1A] rounded" />
              <div className="h-3 w-20 bg-[#1A1A1A] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
