'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MEMBERSHIP_EARLY_BIRD_PRICE, VIP_UPSELL_PRICE } from '@/types'
import { fbpixelTrack } from '@/components/MetaPixel'
import type { BumpProduct } from '@/app/(checkout)/checkout/page'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

type PaymentMethod = {
  code: string
  label: string
  shortLabel: string
  sublabel: string
  color: string
  bg: string
  textColor: string
  localIcon?: string
}

type PaymentGroup = {
  id: string
  label: string
  methods: PaymentMethod[]
}

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'qris',
    label: 'QRIS',
    methods: [
      { code: 'QRIS', label: 'QRIS', shortLabel: 'QRIS', sublabel: 'Semua m-banking & e-wallet', color: '#E31837', bg: '#2a0a0e', textColor: '#ff6b7a', localIcon: '/payment/qris.webp' },
    ],
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    methods: [
      { code: 'OVO',       label: 'OVO',       shortLabel: 'OVO',  sublabel: 'Proses Otomatis', color: '#4C3494', bg: '#160e2a', textColor: '#9d7ef5', localIcon: '/payment/ovo.webp' },
      { code: 'DANA',      label: 'DANA',      shortLabel: 'DANA', sublabel: 'Proses Otomatis', color: '#118EEA', bg: '#041525', textColor: '#5bb8ff', localIcon: '/payment/dana.webp' },
      { code: 'SHOPEEPAY', label: 'ShopeePay', shortLabel: 'SPay', sublabel: 'Proses Otomatis', color: '#EE4D2D', bg: '#2a0f08', textColor: '#ff8066', localIcon: '/payment/shoopepay.webp' },
    ],
  },
  {
    id: 'va',
    label: 'Virtual Account',
    methods: [
      { code: 'BCAVA',      label: 'BCA Virtual Account',      shortLabel: 'BCA',  sublabel: 'Proses Otomatis', color: '#1657A0', bg: '#041020', textColor: '#5b9fd9', localIcon: '/payment/bca.webp' },
      { code: 'MANDIRIVA',  label: 'Mandiri Virtual Account',  shortLabel: 'MDR',  sublabel: 'Proses Otomatis', color: '#F7941D', bg: '#271500', textColor: '#ffb85c', localIcon: '/payment/mandiri.webp' },
      { code: 'BNIVA',      label: 'BNI Virtual Account',      shortLabel: 'BNI',  sublabel: 'Proses Otomatis', color: '#F05A22', bg: '#231008', textColor: '#ff9265', localIcon: '/payment/bni.webp' },
      { code: 'BRIVA',      label: 'BRI Virtual Account',      shortLabel: 'BRI',  sublabel: 'Proses Otomatis', color: '#00529B', bg: '#040f1e', textColor: '#4d9de0', localIcon: '/payment/briva.webp' },
      { code: 'PERMATAVA',  label: 'Permata Virtual Account',  shortLabel: 'PRM',  sublabel: 'Proses Otomatis', color: '#00A651', bg: '#001a0d', textColor: '#33cc77', localIcon: '/payment/permata.webp' },
      { code: 'MUAMALATVA', label: 'Muamalat Virtual Account', shortLabel: 'MML',  sublabel: 'Proses Otomatis', color: '#006633', bg: '#001508', textColor: '#33994d', localIcon: '/payment/muamalat.webp' },
      { code: 'CIMBVA',     label: 'CIMB Niaga Virtual Account', shortLabel: 'CIMB', sublabel: 'Proses Otomatis', color: '#BB0000', bg: '#1e0000', textColor: '#ee4444', localIcon: '/payment/cimb.webp' },
      { code: 'BSIVA',      label: 'BSI Virtual Account',      shortLabel: 'BSI',  sublabel: 'Proses Otomatis', color: '#00704A', bg: '#001510', textColor: '#33cc88', localIcon: '/payment/bsi.webp' },
      { code: 'OCBCVA',     label: 'OCBC Virtual Account',     shortLabel: 'OCBC', sublabel: 'Proses Otomatis', color: '#E60026', bg: '#1e0007', textColor: '#ff4466', localIcon: '/payment/ocbc.webp' },
      { code: 'DANAMONVA',  label: 'Danamon Virtual Account',  shortLabel: 'DNM',  sublabel: 'Proses Otomatis', color: '#D80027', bg: '#1e0008', textColor: '#ff3355', localIcon: '/payment/danamion.webp' },
    ],
  },
]

function MethodLogo({ method, iconUrl }: { method: PaymentMethod; iconUrl?: string }) {
  const src = method.localIcon ?? iconUrl
  if (src) {
    return (
      <div className="w-full h-8 relative">
        <Image
          src={src}
          alt={method.label}
          fill
          className="object-contain object-left"
          sizes="80px"
        />
      </div>
    )
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-none px-2 py-1 text-xs font-bold tracking-wide leading-none"
      style={{ background: method.bg, color: method.textColor, border: `1px solid ${method.color}22` }}
    >
      {method.shortLabel}
    </span>
  )
}

function PaymentCard({
  method,
  iconUrl,
  selected,
  onSelect,
}: {
  method: PaymentMethod
  iconUrl?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col gap-2 p-3 rounded-none border cursor-pointer transition-all text-left w-full ${
        selected
          ? 'border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
          : 'border-[#252525] hover:border-[#383838]'
      }`}
      style={{ background: selected ? 'rgba(212,175,55,0.06)' : '#161616' }}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D4AF37]" />
      )}
      <MethodLogo method={method} iconUrl={iconUrl} />
      <span className="text-[#F5F5F0] text-xs font-medium leading-tight">{method.label}</span>
      <span className="text-[#4ade80] text-[10px] font-medium">{method.sublabel}</span>
    </button>
  )
}

function CollapsibleGroup({
  group,
  selected,
  onSelect,
  defaultOpen,
  channelIcons,
}: {
  group: PaymentGroup
  selected: string
  onSelect: (code: string) => void
  defaultOpen: boolean
  channelIcons: Record<string, string>
}) {
  const [open, setOpen] = useState(defaultOpen)
  const hasSelected = group.methods.some(m => m.code === selected)
  const selectedMethod = group.methods.find(m => m.code === selected)

  return (
    <div className="border border-[#D4AF37]/20 rounded-none overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          hasSelected ? 'bg-[#D4AF37]/8' : 'bg-[#151515] hover:bg-[#1a1a1a]'
        }`}
      >
        <div className="flex items-center gap-2">
          {hasSelected && (
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
          )}
          <span className={`text-sm font-semibold ${hasSelected ? 'text-[#D4AF37]' : 'text-[#F5F5F0]'}`}>
            {group.label}
          </span>
          {hasSelected && selectedMethod && (
            <span className="text-[10px] text-[#888888]">· {selectedMethod.label}</span>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#666666]" />
          : <ChevronDown className="w-4 h-4 text-[#666666]" />
        }
      </button>

      {open && (
        <div className="p-3 bg-[#0f0f0f] grid grid-cols-3 gap-2">
          {group.methods.map(method => (
            <PaymentCard
              key={method.code}
              method={method}
              iconUrl={channelIcons[method.code]}
              selected={selected === method.code}
              onSelect={() => onSelect(method.code)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CheckoutForm({
  channelIcons = {},
  bumpProducts = [],
}: {
  channelIcons?: Record<string, string>
  bumpProducts?: BumpProduct[]
}) {
  const [selected, setSelected] = useState('QRIS')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [vipSelected, setVipSelected] = useState(false)
  const [bonusIds, setBonusIds] = useState<string[]>([])
  const hasBumps = bumpProducts.length > 0
  const selectedBumps = bumpProducts.filter((b) => bonusIds.includes(b.id))
  const toggleBump = (id: string) =>
    setBonusIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feeLoading, setFeeLoading] = useState(false)
  const [adminFee, setAdminFee] = useState<number | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', fullName: '' }
  })

  const fetchFee = useCallback(async (code: string, amount: number) => {
    setFeeLoading(true)
    setAdminFee(null)
    try {
      const res = await fetch(`/api/payment/fee?code=${code}&amount=${amount}`)
      const json = await res.json()
      if (res.ok && json.data) {
        // Ambil customer fee langsung dari Tripay response
        setAdminFee(json.data?.total_fee?.customer ?? 0)
      }
    } catch {
      setAdminFee(null)
    } finally {
      setFeeLoading(false)
    }
  }, [])

  const subtotal =
    MEMBERSHIP_EARLY_BIRD_PRICE +
    (vipSelected ? VIP_UPSELL_PRICE : 0) +
    selectedBumps.reduce((sum, b) => sum + b.bumpPrice, 0)

  useEffect(() => {
    fetchFee(selected, subtotal)
  }, [selected, subtotal, fetchFee])

  async function onSubmit(formData: { email: string; fullName: string }) {
    setLoading(true)
    setError(null)
    fbpixelTrack('InitiateCheckout', {
      value: subtotal,
      currency: 'IDR',
      num_items: 1 + (vipSelected ? 1 : 0) + selectedBumps.length,
    })
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selected,
          email: formData.email,
          fullName: formData.fullName,
          vip: vipSelected,
          bonusIds,
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

  const selectedMethod = PAYMENT_GROUPS.flatMap(g => g.methods).find(m => m.code === selected)
  const total = adminFee !== null ? subtotal + adminFee : subtotal

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= s ? 'bg-[#D4AF37]' : 'bg-[#2a2a2a]'
            }`}
          />
        ))}
      </div>
      <p className="text-[#888888] text-xs mb-4 text-center">Langkah {step} dari 3</p>

      {step === 1 && (
        <div>
          <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-none p-5 mb-4">
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1">Mau Dibimbing Langsung Sampai Bisa?</h2>
            <p className="text-[#888888] text-sm mb-4">
              Konsultasi privat via WhatsApp bareng tim kami. Tanya apa aja sampai kamu paham &amp; jalan.
            </p>
            <label className="flex items-start gap-3 p-3 rounded-none border border-[#D4AF37]/30 bg-[#D4AF37]/5 cursor-pointer">
              <input
                type="checkbox"
                checked={vipSelected}
                onChange={(e) => setVipSelected(e.target.checked)}
                className="accent-[#D4AF37] w-5 h-5 mt-0.5"
              />
              <span className="text-[#F5F5F0] text-sm">
                Ya! Tambahkan Konsultasi VIP via WhatsApp{' '}
                <span className="text-[#D4AF37] font-bold">(+Rp {VIP_UPSELL_PRICE.toLocaleString('id-ID')})</span>
              </span>
            </label>
          </div>
          <Button type="button" onClick={() => setStep(hasBumps ? 2 : 3)} className="w-full py-3">
            Lanjutkan →
          </Button>
          <button
            type="button"
            onClick={() => { setVipSelected(false); setStep(hasBumps ? 2 : 3) }}
            className="w-full text-center text-[#666666] text-xs mt-3 hover:text-[#888888]"
          >
            Nggak dulu, lanjut tanpa VIP
          </button>
        </div>
      )}

      {step === 2 && hasBumps && (
        <div>
          <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-none p-5 mb-4">
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1">Beli Sekali, Untung Berkali-Kali Produk Digital Siap Dijual</h2>
            <p className="text-[#888888] text-sm mb-4">Dapatkan template + panduan siap pakai dengan harga spesial.</p>
            <div className="flex flex-col gap-2">
              {bumpProducts.map((b) => (
                <label key={b.id} className="flex items-start gap-3 p-3 rounded-none border border-[#D4AF37]/30 bg-[#D4AF37]/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bonusIds.includes(b.id)}
                    onChange={() => toggleBump(b.id)}
                    className="accent-[#D4AF37] w-5 h-5 mt-0.5 shrink-0"
                  />
                  {b.coverUrl && (
                    <div className="relative w-12 h-16 shrink-0 rounded-sm overflow-hidden border border-[#D4AF37]/20">
                      <Image src={b.coverUrl} alt={b.title} fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <span className="text-[#F5F5F0] text-sm">
                    Ya, Ambil <span className="font-semibold">{b.title}</span> cuma{' '}
                    <span className="text-[#D4AF37] font-bold">Rp {b.bumpPrice.toLocaleString('id-ID')}</span>
                    {b.originalPrice && b.originalPrice > b.bumpPrice && (
                      <span className="text-[#666666] line-through ml-1">Rp {b.originalPrice.toLocaleString('id-ID')}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Button type="button" onClick={() => setStep(3)} className="w-full py-3">
            Lanjut ke Pembayaran →
          </Button>
          <button
            type="button"
            onClick={() => { setBonusIds([]); setStep(3) }}
            className="w-full text-center text-[#666666] text-xs mt-3 hover:text-[#888888]"
          >
            Lewati penawaran ini
          </button>
        </div>
      )}

      {step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(hasBumps ? 2 : 1)}
            className="text-[#666666] text-xs mb-3 hover:text-[#888888]"
          >
            ← Kembali
          </button>
      {/* Order summary */}
      <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-none p-5 mb-4">
        <h2 className="text-[#F5F5F0] font-semibold mb-3">Ringkasan Pesanan</h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[#888888] text-sm">Profit Dari AI (E-book)</span>
            <span className="text-[#F5F5F0] text-sm font-medium">{fmt(MEMBERSHIP_EARLY_BIRD_PRICE)}</span>
          </div>
          {vipSelected && (
            <div className="flex justify-between items-center">
              <span className="text-[#888888] text-sm">Konsultasi VIP (WhatsApp)</span>
              <span className="text-[#F5F5F0] text-sm font-medium">{fmt(VIP_UPSELL_PRICE)}</span>
            </div>
          )}
          {selectedBumps.map((b) => (
            <div key={b.id} className="flex justify-between items-center">
              <span className="text-[#888888] text-sm">{b.title}</span>
              <span className="text-[#F5F5F0] text-sm font-medium">{fmt(b.bumpPrice)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <span className="text-[#888888] text-sm">Biaya Admin</span>
            {feeLoading ? (
              <span className="text-[#555555] text-xs">Menghitung...</span>
            ) : adminFee !== null ? (
              <span className="text-[#888888] text-sm">{adminFee === 0 ? 'Gratis' : fmt(adminFee)}</span>
            ) : (
              <span className="text-[#555555] text-xs">—</span>
            )}
          </div>
          <div className="border-t border-[#222222] pt-2 mt-1 flex justify-between items-center">
            <span className="text-[#F5F5F0] text-sm font-semibold">Total</span>
            <span className="text-[#D4AF37] font-bold text-base">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Buyer info */}
      <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-none p-5 mb-4">
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

      {/* Payment method selection */}
      <div className="mb-4">
        <h2 className="text-[#F5F5F0] font-semibold mb-3">Metode Pembayaran</h2>
        <div className="flex flex-col gap-2">
          {PAYMENT_GROUPS.map((group, i) => (
            <CollapsibleGroup
              key={group.id}
              group={group}
              selected={selected}
              onSelect={setSelected}
              defaultOpen={i === 0}
              channelIcons={channelIcons}
            />
          ))}
        </div>
      </div>

      {/* Selected method summary */}
      {selectedMethod && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-none border border-[#D4AF37]/20 bg-[#D4AF37]/5 mb-4">
          <div className="w-10 h-6 relative shrink-0">
            {selectedMethod.localIcon || channelIcons[selectedMethod.code] ? (
              <Image
                src={selectedMethod.localIcon || channelIcons[selectedMethod.code]!}
                alt={selectedMethod.label}
                fill
                className="object-contain object-left"
                sizes="40px"
              />
            ) : (
              <span
                className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: selectedMethod.bg, color: selectedMethod.textColor }}
              >
                {selectedMethod.shortLabel}
              </span>
            )}
          </div>
          <span className="text-[#F5F5F0] text-sm flex-1">{selectedMethod.label}</span>
          <span className="text-[#D4AF37] font-bold text-sm">{fmt(total)}</span>
        </div>
      )}

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

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-[#555555]" />
        <p className="text-[#888888] text-xs">SSL Aman · Diproses via Tripay</p>
      </div>
        </>
      )}
    </form>
  )
}
