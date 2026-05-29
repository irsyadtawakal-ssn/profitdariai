'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

const PAYMENT_METHODS = [
  { code: 'QRIS', label: 'QRIS (Semua e-wallet & m-banking)', group: 'qris' },
  { code: 'OVO', label: 'OVO', group: 'ewallet' },
  { code: 'DANA', label: 'Dana', group: 'ewallet' },
  { code: 'SHOPEEPAY', label: 'ShopeePay', group: 'ewallet' },
  { code: 'BCAVA', label: 'BCA Virtual Account', group: 'va' },
  { code: 'MANDIRIVA', label: 'Mandiri Virtual Account', group: 'va' },
  { code: 'BNIVA', label: 'BNI Virtual Account', group: 'va' },
  { code: 'BRIVA', label: 'BRI Virtual Account', group: 'va' },
]

export function CheckoutForm() {
  const [selected, setSelected] = useState('QRIS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', fullName: '' }
  })

  async function onSubmit(formData: { email: string; fullName: string }) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selected,
          email: formData.email,
          fullName: formData.fullName,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Gagal membuat transaksi, coba beberapa saat lagi.')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Gagal membuat transaksi, coba beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }

  const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(MEMBERSHIP_EARLY_BIRD_PRICE)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
        <h2 className="text-[#F5F5F0] font-semibold mb-1">Ringkasan Pesanan</h2>
        <div className="flex justify-between items-center mt-3">
          <span className="text-[#888888] text-sm">profitdariai Membership</span>
          <span className="text-[#D4AF37] font-bold">{formatted}</span>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
        <h2 className="text-[#F5F5F0] font-semibold mb-4">Data Pembeli</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[#F5F5F0] text-sm font-medium mb-2">Nama Lengkap</label>
            <Input
              type="text"
              placeholder="Nama kamu"
              {...register('fullName', { required: 'Nama wajib diisi' })}
              className="bg-[#1a1a1a] border-[#333333] text-[#F5F5F0]"
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[#F5F5F0] text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email tidak valid' } })}
              className="bg-[#1a1a1a] border-[#333333] text-[#F5F5F0]"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
            <p className="text-[#888888] text-xs mt-2">Kami akan kirim link untuk set password ke email ini</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
        <h2 className="text-[#F5F5F0] font-semibold mb-4">Metode Pembayaran</h2>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map(({ code, label }) => (
            <label
              key={code}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected === code
                  ? 'border-[#D4AF37]/60 bg-[#D4AF37]/5'
                  : 'border-[#222222] hover:border-[#333333]'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={code}
                checked={selected === code}
                onChange={() => setSelected(code)}
                className="accent-[#D4AF37]"
              />
              <span className="text-[#F5F5F0] text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-400 text-sm mb-4 text-center">
          {error}
        </p>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full py-3"
      >
        Bayar Sekarang
      </Button>

      <p className="text-[#888888] text-xs text-center mt-4">
        🔒 SSL Aman · Diproses via Tripay
      </p>
    </form>
  )
}
