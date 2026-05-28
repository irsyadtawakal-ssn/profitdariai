export default function MemberLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      {/* Page title skeleton */}
      <div className="h-8 w-48 bg-[#1A1A1A] rounded-lg mb-8" />

      {/* Status bar skeleton */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="h-6 w-24 bg-[#1A1A1A] rounded-full" />
        <div className="h-4 w-40 bg-[#1A1A1A] rounded" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
            <div className="h-7 w-12 bg-[#1A1A1A] rounded mx-auto mb-2" />
            <div className="h-3 w-16 bg-[#1A1A1A] rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-[#1A1A1A] rounded" />
        <div className="h-4 w-20 bg-[#1A1A1A] rounded" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
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

      {/* Second section skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-[#1A1A1A] rounded" />
        <div className="h-4 w-20 bg-[#1A1A1A] rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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
