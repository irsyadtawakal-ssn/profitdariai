export default function MateriDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      {/* Hero card skeleton */}
      <div className="rounded-2xl border border-[#1E1E1E] bg-[#0E0E0E] p-6 flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-28 md:w-[120px] aspect-[3/4] rounded-xl bg-[#1A1A1A] flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-20 bg-[#1A1A1A] rounded" />
          <div className="h-7 w-3/4 bg-[#1A1A1A] rounded-lg" />
          <div className="h-4 w-32 bg-[#1A1A1A] rounded" />
          <div className="h-10 w-40 bg-[#1A1A1A] rounded-lg mt-4" />
        </div>
      </div>
      {/* Description skeleton */}
      <div className="h-3 w-28 bg-[#1A1A1A] rounded mb-3" />
      <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 space-y-2">
        <div className="h-3 w-full bg-[#1A1A1A] rounded" />
        <div className="h-3 w-5/6 bg-[#1A1A1A] rounded" />
        <div className="h-3 w-4/6 bg-[#1A1A1A] rounded" />
      </div>
    </div>
  )
}
