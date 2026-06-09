'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { fbpixelTrack } from '@/components/MetaPixel'

export interface CheckoutProduct {
  id: string
  title: string
  price: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

const PAYMENT_METHODS = [
  { value: 'QRIS', label: 'QRIS (Semua E-wallet)' },
  { value: 'BRIVA', label: 'BRI Virtual Account' },
  { value: 'BCAVA', label: 'BCA Virtual Account' },
  { value: 'MANDIRIVA', label: 'Mandiri Virtual Account' },
  { value: 'BNIVA', label: 'BNI Virtual Account' },
]

export function CheckoutModal({
  product,
  userEmail,
  userFullName,
  onClose,
}: {
  product: CheckoutProduct
  userEmail: string
  userFullName: string
  onClose: () => void
}) {
  const [paymentMethod, setPaymentMethod] = useState('QRIS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setError(null)
    setLoading(true)
    fbpixelTrack('InitiateCheckout', {
      value: product.price,
      currency: 'IDR',
      content_name: product.title,
      num_items: 1,
    })
    try {
      const res = await fetch('/api/payment/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat transaksi.')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0E0E0E] border border-[#D4AF37]/30 w-full max-w-md rounded-none">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-1">Checkout</p>
            <h3 className="font-display text-white font-bold text-sm">{product.title}</h3>
            <p className="text-[#D4AF37] font-mono text-xs font-bold">{formatPrice(product.price)}</p>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#111] border border-[#222] px-4 py-3 space-y-1">
            <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">Pembeli</p>
            <p className="text-sm text-[#F5F5F0] font-medium">{userFullName}</p>
            <p className="text-xs text-[#888]">{userEmail}</p>
          </div>
          <div>
            <label className="block font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition-all rounded-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        </div>
        <div className="p-6 border-t border-[#222] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#333] text-[#888] py-3 text-[10px] font-mono uppercase tracking-wider hover:text-white transition-colors rounded-none"
          >
            Batal
          </button>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/90 transition-all disabled:opacity-50 rounded-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}
