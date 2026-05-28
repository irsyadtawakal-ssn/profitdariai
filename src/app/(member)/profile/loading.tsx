export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-8 w-36 bg-[#1A1A1A] rounded-lg mb-8" />
      {/* Avatar card */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-[#1A1A1A] rounded" />
          <div className="h-3 w-48 bg-[#1A1A1A] rounded" />
        </div>
      </div>
      {/* Status card */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6 space-y-3">
        <div className="h-5 w-40 bg-[#1A1A1A] rounded mb-4" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-[#1A1A1A] rounded-full" />
          <div className="h-4 w-36 bg-[#1A1A1A] rounded" />
        </div>
      </div>
      {/* Transactions card */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
        <div className="h-5 w-40 bg-[#1A1A1A] rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#222222] last:border-0">
            <div className="space-y-1">
              <div className="h-4 w-28 bg-[#1A1A1A] rounded" />
              <div className="h-3 w-36 bg-[#1A1A1A] rounded" />
            </div>
            <div className="h-5 w-14 bg-[#1A1A1A] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
