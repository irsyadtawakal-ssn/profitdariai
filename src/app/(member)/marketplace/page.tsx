import { ShoppingBag } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-[#D4AF37]" />
      </div>
      <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-4">
        Coming Soon
      </span>
      <h1 className="text-3xl font-bold text-[#F5F5F0] mb-3">Marketplace</h1>
      <p className="text-[#888888] max-w-sm leading-relaxed">
        Segera hadir — produk digital pilihan untuk memaksimalkan profit kamu dari AI.
      </p>
    </div>
  )
}
