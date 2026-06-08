# Checkout Funnel + Order Bumps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah harga 199k→99k dan rombak checkout menjadi funnel 3-step dengan 2 order bump (VIP konsultasi WhatsApp +50k, bonus ebook harga miring) sebelum pembayaran.

**Architecture:** Wizard 1-route di `/checkout` (state React, 3 step). Harga selalu dihitung ulang server-side di `/api/payment/create` dari konstanta + DB. VIP disimpan sebagai flag `profiles.is_vip`; bonus ebook di-grant via mekanisme `metadata.ebook_ids[]` yang sudah ada.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (Postgres + RLS), Tripay, Tailwind, react-hook-form, lucide-react.

**Catatan testing:** Proyek tidak punya test framework. Verifikasi tiap task = `pnpm typecheck` + `pnpm lint` (harus lolos) + cek manual browser di step yang relevan. Migrations dijalankan manual di Supabase SQL editor oleh user.

---

## File Structure

| File | Tanggung jawab |
|---|---|
| `src/types/index.ts` | Konstanta harga (`MEMBERSHIP_EARLY_BIRD_PRICE`=99k, `VIP_UPSELL_PRICE`=50k) |
| `supabase/migrations/20260608_add_is_vip.sql` | Kolom `profiles.is_vip` |
| `supabase/migrations/20260608_add_bump_product.sql` | Kolom `ebooks.is_bump_product`, `ebooks.bump_price` |
| `src/app/(marketing)/page.tsx` | Harga landing 199k coret → 99k + semua copy |
| `src/app/(checkout)/checkout/page.tsx` | Fetch bump ebook, subtitle harga, pass ke form |
| `src/components/member/CheckoutForm.tsx` | Wizard 3-step + 2 bump + perhitungan subtotal |
| `src/app/api/payment/fee/route.ts` | Terima param `amount` |
| `src/app/api/payment/create/route.ts` | Terima `vip`/`bonus`, subtotal multi-item, metadata |
| `src/app/api/payment/webhook/route.ts` | Set `is_vip` saat `metadata.vip` |
| `src/app/(admin)/admin/materi/MateriDialog.tsx` | Field bump product + harga |
| `src/app/(admin)/admin/materi/actions` (server action ebook) | Simpan `is_bump_product`/`bump_price` |
| `src/app/(admin)/admin/members/page.tsx` | Badge VIP |

---

## Task 1: Konstanta harga

**Files:**
- Modify: `src/types/index.ts:33-35`

- [ ] **Step 1: Ubah base price & tambah konstanta VIP**

Di `src/types/index.ts`, ganti baris:
```ts
export const MEMBERSHIP_PRICE = 999_000
export const MEMBERSHIP_EARLY_BIRD_PRICE = 199_000
export const MEMBERSHIP_LIFETIME_EXPIRY = '2099-12-31T23:59:59.000Z'
```
menjadi:
```ts
export const MEMBERSHIP_PRICE = 999_000
export const MEMBERSHIP_EARLY_BIRD_PRICE = 99_000
export const VIP_UPSELL_PRICE = 50_000
export const MEMBERSHIP_LIFETIME_EXPIRY = '2099-12-31T23:59:59.000Z'
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: base price 99k + VIP_UPSELL_PRICE constant"
```

---

## Task 2: Migrations DB

**Files:**
- Create: `supabase/migrations/20260608_add_is_vip.sql`
- Create: `supabase/migrations/20260608_add_bump_product.sql`

- [ ] **Step 1: Buat migration is_vip**

Isi `supabase/migrations/20260608_add_is_vip.sql`:
```sql
-- VIP flag untuk member yang ambil upsell konsultasi WhatsApp
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
```

- [ ] **Step 2: Buat migration bump product**

Isi `supabase/migrations/20260608_add_bump_product.sql`:
```sql
-- Produk bump di checkout step 2 (1 ebook, harga miring)
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS is_bump_product BOOLEAN DEFAULT false;
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS bump_price INTEGER;
```

- [ ] **Step 3: User menjalankan migration**

Minta user jalankan kedua file SQL di Supabase SQL editor (urutan bebas, keduanya idempotent). Konfirmasi tidak ada error sebelum lanjut.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260608_add_is_vip.sql supabase/migrations/20260608_add_bump_product.sql
git commit -m "feat: migrations is_vip + bump product columns"
```

---

## Task 3: Landing page harga

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (baris 62-63, 318-319, 336, 360, 382)

- [ ] **Step 1: Topbar (baris ~62-63)**

Ganti teks `Akses Penuh Rp 199K` → `Akses Penuh Rp 99K`.

- [ ] **Step 2: Pricing card (baris ~318-319)**

Ganti:
```tsx
<div className="price-old">Rp 999.000</div>
<div className="price-new"><small>Rp </small>199.000</div>
```
menjadi:
```tsx
<div className="price-old">Rp 199.000</div>
<div className="price-new"><small>Rp </small>99.000</div>
```

- [ ] **Step 3: Tombol CTA (baris ~336 dan ~382)**

Ganti kedua teks tombol `Rp 199.000` → `Rp 99.000`:
- `🚀 Dapatkan Akses Sekarang — Rp 99.000`
- `🚀 Mulai Sekarang — Rp 99.000`

- [ ] **Step 4: FAQ (baris ~360)**

Ganti string FAQ: `'Ya. Harga Rp 199.000 adalah harga early bird...'` → `'Ya. Harga Rp 99.000 adalah harga early bird...'`

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`
Expected: PASS
Lalu cek manual: `pnpm dev` → buka landing, pastikan 199.000 tampil dicoret dan 99.000 sebagai harga utama, tidak ada sisa "199.000" di tombol/FAQ/topbar.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(marketing)/page.tsx"
git commit -m "feat: landing price 199k strikethrough -> 99k"
```

---

## Task 4: Fee API terima param amount

**Files:**
- Modify: `src/app/api/payment/fee/route.ts`

- [ ] **Step 1: Ubah route untuk baca param amount**

Ganti seluruh isi `src/app/api/payment/fee/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { getFeeCalculator } from '@/lib/tripay/client'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const amountParam = searchParams.get('amount')

  if (!code) {
    return NextResponse.json({ error: 'code wajib diisi' }, { status: 400 })
  }

  // Amount dinamis (subtotal funnel); fallback ke base price.
  const parsed = amountParam ? parseInt(amountParam, 10) : NaN
  const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : MEMBERSHIP_EARLY_BIRD_PRICE

  const result = await getFeeCalculator(code, amount)

  if (!result.success) {
    return NextResponse.json({ error: 'Gagal mengambil biaya admin' }, { status: 400 })
  }

  const feeData = Array.isArray(result.data) ? result.data[0] : result.data
  return NextResponse.json({ data: feeData })
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payment/fee/route.ts
git commit -m "feat: fee API accepts dynamic amount param"
```

---

## Task 5: Create API — multi-item + VIP + bonus

**Files:**
- Modify: `src/app/api/payment/create/route.ts`

- [ ] **Step 1: Tambah parse vip/bonus + hitung subtotal server-side**

Di `src/app/api/payment/create/route.ts`, ganti baris 6 import:
```ts
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'
```
menjadi:
```ts
import { MEMBERSHIP_EARLY_BIRD_PRICE, VIP_UPSELL_PRICE } from '@/types'
```

Ganti baris 9-10:
```ts
  const body = await request.json()
  const { paymentMethod, email, fullName } = body
```
menjadi:
```ts
  const body = await request.json()
  const { paymentMethod, email, fullName, vip, bonus } = body
  const wantVip = vip === true
  const wantBonus = bonus === true
```

- [ ] **Step 2: Fetch bump ebook + bangun order items & subtotal**

Setelah blok fetch `mainEbook` (sekitar baris 44-46, sebelum `merchantRef`), tambahkan fetch bump ebook:
```ts
  // Fetch bump ebook (step 2) bila admin mengonfigurasi & user memilih bonus
  let bumpEbook: { id: string; title: string; bump_price: number } | null = null
  if (wantBonus) {
    const { data: bump } = await adminClient
      .from('ebooks')
      .select('id, title, bump_price')
      .eq('is_published', true)
      .eq('is_bump_product', true)
      .not('bump_price', 'is', null)
      .limit(1)
      .single()
    if (bump && typeof bump.bump_price === 'number' && bump.bump_price > 0) {
      bumpEbook = bump
    }
  }
```

Ganti baris 53 `const baseAmount = MEMBERSHIP_EARLY_BIRD_PRICE` dan blok order_items menjadi perhitungan subtotal multi-item. Ganti baris 53:
```ts
  const baseAmount = MEMBERSHIP_EARLY_BIRD_PRICE
```
menjadi:
```ts
  // Subtotal dihitung SERVER-SIDE (jangan percaya harga client)
  const mainProductName = mainEbook?.title ?? 'Profit Dari AI (E-book)'
  const mainSku = `PDA-EBOOK-${mainEbook?.id?.slice(0, 8).toUpperCase() ?? 'MAIN'}`

  type OrderItem = { sku: string; name: string; price: number; quantity: number }
  const items: OrderItem[] = [
    { sku: mainSku, name: mainProductName, price: MEMBERSHIP_EARLY_BIRD_PRICE, quantity: 1 },
  ]
  const ebookIds: string[] = mainEbook ? [mainEbook.id] : []

  if (wantVip) {
    items.push({ sku: 'PDA-VIP-CONSULT', name: 'Konsultasi VIP via WhatsApp', price: VIP_UPSELL_PRICE, quantity: 1 })
  }
  if (bumpEbook) {
    items.push({ sku: `PDA-BUMP-${bumpEbook.id.slice(0, 8).toUpperCase()}`, name: bumpEbook.title, price: bumpEbook.bump_price, quantity: 1 })
    ebookIds.push(bumpEbook.id)
  }

  const baseAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
```

- [ ] **Step 3: Kirim order_items dinamis + simpan metadata vip/ebook_ids**

Ganti blok `getFeeCalculator` lama tetap pakai `baseAmount` (sudah subtotal). Lalu ganti `productName`/`productSku` lama (baris 62-63) — hapus keduanya karena sudah diganti `mainProductName`/`mainSku` di Step 2.

Ganti blok `order_items` di `createTransaction` (baris 73-80):
```ts
    order_items: [
      {
        sku: productSku,
        name: productName,
        price: totalAmount,
        quantity: 1,
      },
    ],
```
menjadi:
```ts
    order_items: items,
```

Catatan: `totalAmount = baseAmount + fee`. Karena Tripay butuh jumlah `order_items` boleh tidak sama persis dengan `amount` (fee terpisah), kirim `items` apa adanya (harga produk asli). `amount: totalAmount` tetap.

Ganti blok `metadata` di insert transaksi (baris 101-104):
```ts
    metadata: {
      ...result.data,
      ebook_ids: mainEbook ? [mainEbook.id] : [],
    },
```
menjadi:
```ts
    metadata: {
      ...result.data,
      ebook_ids: ebookIds,
      vip: wantVip,
    },
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: PASS. Pastikan tidak ada referensi sisa ke `productName`/`productSku` yang sudah dihapus.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payment/create/route.ts
git commit -m "feat: create payment with VIP + bonus multi-item subtotal"
```

---

## Task 6: Webhook — set is_vip

**Files:**
- Modify: `src/app/api/payment/webhook/route.ts`

- [ ] **Step 1: Set is_vip saat PAID**

Di `src/app/api/payment/webhook/route.ts`, di dalam blok `if (status === 'PAID')`, setelah blok grant ebooks (setelah baris ~163, sebelum `}` penutup `if (status === 'PAID')`), tambahkan:
```ts
    // Set VIP flag bila user ambil upsell konsultasi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isVipPurchase = (tx.metadata as any)?.vip === true
    if (userId && isVipPurchase) {
      const { error: vipError } = await supabase
        .from('profiles')
        .update({ is_vip: true })
        .eq('id', userId)
      if (vipError) {
        console.error('[webhook] Failed to set is_vip:', vipError)
      } else {
        console.log(`[webhook] Set is_vip=true for user ${userId}`)
      }
    }
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payment/webhook/route.ts
git commit -m "feat: webhook sets is_vip on VIP purchase"
```

---

## Task 7: Admin — field bump product di MateriDialog

**Files:**
- Modify: `src/app/(admin)/admin/materi/MateriDialog.tsx`
- Modify: server action ebook (file yang menerima formData ebook — temukan via grep `is_featured` di folder `src/app/(admin)/admin/materi/`)

- [ ] **Step 1: Temukan server action**

Run: `grep -rln "is_featured" "src/app/(admin)/admin/materi/"`
Catat file yang berisi `formData.get('is_featured')` (server action). Baca cara `is_featured` & `marketplace_price` diparse + disimpan agar pola diikuti persis.

- [ ] **Step 2: Tambah state di MateriDialog**

Di `MateriDialog.tsx`, dekat deklarasi `isFeatured` (baris ~72), tambah state:
```ts
  const [isBumpProduct, setIsBumpProduct] = useState(materi?.is_bump_product ?? false)
  const [bumpPrice, setBumpPrice] = useState(materi?.bump_price?.toString() ?? '')
```
Dan di blok reset (dekat baris ~87 `setIsFeatured(...)`):
```ts
    setIsBumpProduct(materi?.is_bump_product ?? false)
    setBumpPrice(materi?.bump_price?.toString() ?? '')
```
Tambahkan juga field di tipe `materi` (interface dekat baris 46 `is_featured: boolean | null`):
```ts
  is_bump_product: boolean | null
  bump_price: number | null
```

- [ ] **Step 3: Kirim di formData**

Dekat baris ~159 `formData.set('is_featured', ...)`, tambahkan:
```ts
    formData.set('is_bump_product', isBumpProduct ? 'true' : 'false')
    formData.set('bump_price', bumpPrice)
```

- [ ] **Step 4: Tambah UI checkbox + input**

Setelah blok checkbox `is_featured` (sekitar baris 334-335), tambahkan:
```tsx
            <div className="flex items-center gap-2 mt-3">
              <input type="checkbox" id="m_bump" checked={isBumpProduct} onChange={(e) => setIsBumpProduct(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_bump">Jadikan Produk Bump Checkout (Step 2)</Label>
            </div>
            {isBumpProduct && (
              <div className="mt-2">
                <Label htmlFor="m_bump_price">Harga Bump (IDR)</Label>
                <Input
                  id="m_bump_price"
                  type="number"
                  value={bumpPrice}
                  onChange={(e) => setBumpPrice(e.target.value)}
                  placeholder="Contoh: 47000"
                  className="bg-[#1a1a1a] border-[#333333] text-[#F5F5F0]"
                />
              </div>
            )}
```

- [ ] **Step 5: Simpan di server action**

Di server action (dari Step 1), ikuti pola `is_featured`/`marketplace_price`. Tambahkan ke object yang di-insert/update ke tabel `ebooks`:
```ts
    is_bump_product: formData.get('is_bump_product') === 'true',
    bump_price: formData.get('bump_price') ? parseInt(formData.get('bump_price') as string, 10) : null,
```
(Sesuaikan nama variabel formData dengan yang dipakai di file tersebut.)

- [ ] **Step 6: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS. Cek manual: buka `/admin/materi`, edit sebuah ebook, centang "Produk Bump Checkout", isi harga, simpan, buka lagi → nilai tersimpan.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(admin)/admin/materi/"
git commit -m "feat: admin can set ebook as checkout bump product + price"
```

---

## Task 8: Admin — badge VIP di members

**Files:**
- Modify: `src/app/(admin)/admin/members/page.tsx`

- [ ] **Step 1: Baca struktur halaman members**

Baca `src/app/(admin)/admin/members/page.tsx` untuk lihat query profiles & render baris member. Pastikan select menyertakan `is_vip` (tambahkan ke `.select(...)` bila pakai kolom eksplisit).

- [ ] **Step 2: Tampilkan badge**

Pada render nama/email tiap member, tambahkan badge bila `member.is_vip`:
```tsx
{member.is_vip && (
  <span className="ml-2 inline-flex items-center rounded-none border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
    VIP
  </span>
)}
```
(Sesuaikan nama variabel iterasi dengan yang ada di file.)

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: PASS. Cek manual: member dengan `is_vip=true` (set manual di Supabase untuk tes) tampil badge VIP di `/admin/members`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/members/page.tsx"
git commit -m "feat: VIP badge in admin members list"
```

---

## Task 9: Checkout page — fetch bump ebook & subtitle

**Files:**
- Modify: `src/app/(checkout)/checkout/page.tsx`

- [ ] **Step 1: Fetch bump ebook & ubah subtitle**

Ganti seluruh isi `src/app/(checkout)/checkout/page.tsx`:
```tsx
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentChannels } from '@/lib/tripay/client'
import { CheckoutForm } from '@/components/member/CheckoutForm'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export type BumpProduct = {
  id: string
  title: string
  bumpPrice: number
  originalPrice: number | null
}

export default async function CheckoutPage() {
  const [supabase, channelsRes] = await Promise.all([
    createServerClient(),
    getPaymentChannels().catch(() => ({ success: false, data: [] })),
  ])

  await supabase.auth.getUser()

  const channelIcons: Record<string, string> = {}
  if (channelsRes.success) {
    for (const ch of channelsRes.data) {
      if (ch.icon_url) channelIcons[ch.code] = ch.icon_url
    }
  }

  // Fetch bump product (step 2) bila admin sudah mengonfigurasi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any
  const { data: bump } = await adminClient
    .from('ebooks')
    .select('id, title, bump_price, marketplace_original_price, marketplace_price')
    .eq('is_published', true)
    .eq('is_bump_product', true)
    .not('bump_price', 'is', null)
    .limit(1)
    .single()

  const bumpProduct: BumpProduct | null =
    bump && typeof bump.bump_price === 'number' && bump.bump_price > 0
      ? {
          id: bump.id,
          title: bump.title,
          bumpPrice: bump.bump_price,
          originalPrice: bump.marketplace_original_price ?? bump.marketplace_price ?? null,
        }
      : null

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Bergabung Sekarang</h1>
          <p className="text-[#888888] text-sm">
            Akses Profit Dari AI — Rp {MEMBERSHIP_EARLY_BIRD_PRICE.toLocaleString('id-ID')} (Sekali Bayar)
          </p>
        </div>
        <CheckoutForm channelIcons={channelIcons} bumpProduct={bumpProduct} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: FAIL sementara — `CheckoutForm` belum menerima prop `bumpProduct` (akan dibetulkan di Task 10). Lanjut ke Task 10 sebelum commit.

- [ ] **Step 3: (Tunda commit)**

Commit digabung di akhir Task 10 setelah `CheckoutForm` menerima prop baru.

---

## Task 10: CheckoutForm — wizard 3-step + 2 bump

**Files:**
- Modify: `src/components/member/CheckoutForm.tsx`

Catatan: pertahankan SEMUA logika pembayaran existing (PAYMENT_GROUPS, MethodLogo, PaymentCard, CollapsibleGroup, fetchFee, onSubmit). Hanya tambah: state wizard, perhitungan subtotal, kirim `vip`/`bonus` + `amount`, dan UI 3-step.

- [ ] **Step 1: Tambah import & prop**

Ubah import konstanta (baris 9):
```ts
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'
```
menjadi:
```ts
import { MEMBERSHIP_EARLY_BIRD_PRICE, VIP_UPSELL_PRICE } from '@/types'
import type { BumpProduct } from '@/app/(checkout)/checkout/page'
```

Ubah signature komponen (baris 183):
```ts
export function CheckoutForm({ channelIcons = {} }: { channelIcons?: Record<string, string> }) {
```
menjadi:
```ts
export function CheckoutForm({
  channelIcons = {},
  bumpProduct = null,
}: {
  channelIcons?: Record<string, string>
  bumpProduct?: BumpProduct | null
}) {
```

- [ ] **Step 2: Tambah state wizard & subtotal**

Setelah baris `const [selected, setSelected] = useState('QRIS')` (baris 184), tambahkan:
```ts
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [vipSelected, setVipSelected] = useState(false)
  const [bonusSelected, setBonusSelected] = useState(false)
```

- [ ] **Step 3: Hitung subtotal & kirim amount ke fetchFee**

Ganti perhitungan `base`/`total` (baris 241-242):
```ts
  const base = MEMBERSHIP_EARLY_BIRD_PRICE
  const total = adminFee !== null ? base + adminFee : base
```
menjadi:
```ts
  const subtotal =
    MEMBERSHIP_EARLY_BIRD_PRICE +
    (vipSelected ? VIP_UPSELL_PRICE : 0) +
    (bonusSelected && bumpProduct ? bumpProduct.bumpPrice : 0)
  const base = subtotal
  const total = adminFee !== null ? subtotal + adminFee : subtotal
```

Ubah `fetchFee` agar mengirim `amount`. Ganti baris 197:
```ts
      const res = await fetch(`/api/payment/fee?code=${code}`)
```
menjadi:
```ts
      const res = await fetch(`/api/payment/fee?code=${code}&amount=${amount}`)
```
Ubah signature `fetchFee` (baris 193) agar terima amount:
```ts
  const fetchFee = useCallback(async (code: string) => {
```
menjadi:
```ts
  const fetchFee = useCallback(async (code: string, amount: number) => {
```
Ubah `useEffect` pemanggil (baris 210-212):
```ts
  useEffect(() => {
    fetchFee(selected)
  }, [selected, fetchFee])
```
menjadi:
```ts
  useEffect(() => {
    fetchFee(selected, subtotal)
  }, [selected, subtotal, fetchFee])
```

- [ ] **Step 4: Kirim vip/bonus di onSubmit**

Di body `fetch('/api/payment/create')` (baris 221-225), tambahkan field:
```ts
        body: JSON.stringify({
          paymentMethod: selected,
          email: formData.email,
          fullName: formData.fullName,
          vip: vipSelected,
          bonus: bonusSelected,
        }),
```

- [ ] **Step 5: Bungkus step navigation di handleSubmit**

`onSubmit` form HANYA boleh men-trigger pembayaran di step 3. Karena tombol "Lanjutkan" di step 1/2 bukan submit, gunakan `type="button"` untuk navigasi (lihat Step 6-8). Tidak ada perubahan di `onSubmit` selain Step 4.

- [ ] **Step 6: Render — progress + conditional step**

Ganti `return (...)` besar (mulai baris 244 `return (`) sehingga form merender step berbeda. Struktur baru: bungkus seluruh isi dengan indikator step di atas, lalu tampilkan blok sesuai `step`.

Tambahkan progress indicator tepat setelah `<form ...>` pembuka (baris 245):
```tsx
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
```

- [ ] **Step 7: Step 1 (VIP) & Step 2 (Bonus) blocks**

Sisipkan SEBELUM blok "Order summary" existing (yang akan jadi bagian step 3), bungkus step 1 & 2 dengan kondisi. Tambahkan:
```tsx
      {step === 1 && (
        <div>
          <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-none p-5 mb-4">
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1">Mau Dibimbing Langsung Sampai Bisa?</h2>
            <p className="text-[#888888] text-sm mb-4">
              Konsultasi privat via WhatsApp bareng tim kami. Tanya apa aja sampai kamu paham & jalan.
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
          <Button type="button" onClick={() => setStep(bumpProduct ? 2 : 3)} className="w-full py-3">
            Lanjutkan →
          </Button>
          <button
            type="button"
            onClick={() => { setVipSelected(false); setStep(bumpProduct ? 2 : 3) }}
            className="w-full text-center text-[#666666] text-xs mt-3 hover:text-[#888888]"
          >
            Nggak dulu, lanjut tanpa VIP
          </button>
        </div>
      )}

      {step === 2 && bumpProduct && (
        <div>
          <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-none p-5 mb-4">
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1">Tunggu! Ada 1 Penawaran Spesial Buat Kamu</h2>
            <p className="text-[#888888] text-sm mb-4">Sekali ini aja, harga khusus buat kamu yang baru gabung.</p>
            <label className="flex items-start gap-3 p-3 rounded-none border border-[#D4AF37]/30 bg-[#D4AF37]/5 cursor-pointer">
              <input
                type="checkbox"
                checked={bonusSelected}
                onChange={(e) => setBonusSelected(e.target.checked)}
                className="accent-[#D4AF37] w-5 h-5 mt-0.5"
              />
              <span className="text-[#F5F5F0] text-sm">
                Ya, Ambil <span className="font-semibold">{bumpProduct.title}</span> cuma{' '}
                <span className="text-[#D4AF37] font-bold">Rp {bumpProduct.bumpPrice.toLocaleString('id-ID')}</span>
                {bumpProduct.originalPrice && bumpProduct.originalPrice > bumpProduct.bumpPrice && (
                  <span className="text-[#666666] line-through ml-1">Rp {bumpProduct.originalPrice.toLocaleString('id-ID')}</span>
                )}
              </span>
            </label>
          </div>
          <Button type="button" onClick={() => setStep(3)} className="w-full py-3">
            Lanjut ke Pembayaran →
          </Button>
          <button
            type="button"
            onClick={() => { setBonusSelected(false); setStep(3) }}
            className="w-full text-center text-[#666666] text-xs mt-3 hover:text-[#888888]"
          >
            Lewati penawaran ini
          </button>
        </div>
      )}
```

- [ ] **Step 8: Bungkus step 3 (existing content)**

Bungkus SEMUA blok existing (Order summary, Buyer info, Payment method, Selected method summary, error, tombol "Bayar Sekarang", SSL note) dengan `{step === 3 && ( ... )}`. Di dalam Order summary, tambahkan baris VIP & bonus bila dipilih, setelah baris produk utama (setelah baris 253):
```tsx
          {vipSelected && (
            <div className="flex justify-between items-center">
              <span className="text-[#888888] text-sm">Konsultasi VIP (WhatsApp)</span>
              <span className="text-[#F5F5F0] text-sm font-medium">{fmt(VIP_UPSELL_PRICE)}</span>
            </div>
          )}
          {bonusSelected && bumpProduct && (
            <div className="flex justify-between items-center">
              <span className="text-[#888888] text-sm">{bumpProduct.title}</span>
              <span className="text-[#F5F5F0] text-sm font-medium">{fmt(bumpProduct.bumpPrice)}</span>
            </div>
          )}
```
Tambahkan juga tombol "← Kembali" kecil di atas step 3 untuk balik ke penawaran:
```tsx
          <button
            type="button"
            onClick={() => setStep(bumpProduct ? 2 : 1)}
            className="text-[#666666] text-xs mb-3 hover:text-[#888888]"
          >
            ← Kembali
          </button>
```

- [ ] **Step 9: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS (termasuk Task 9 yang tadi tertunda).

Cek manual (`pnpm dev` → `/checkout`):
1. Step 1 tampil dulu (VIP). Centang VIP → Lanjutkan.
2. Step 2 tampil (bonus) bila ada bump product; centang → Lanjut ke Pembayaran.
3. Step 3: ringkasan menampilkan produk utama + VIP + bonus, total = subtotal + fee. Ganti metode bayar → fee ikut dihitung ulang.
4. Tanpa bump product terkonfigurasi: step 1 → langsung step 3 (step 2 ter-skip).

- [ ] **Step 10: Commit (gabung Task 9 + 10)**

```bash
git add "src/components/member/CheckoutForm.tsx" "src/app/(checkout)/checkout/page.tsx"
git commit -m "feat: checkout wizard 3-step with VIP + bonus order bumps"
```

---

## Task 11: Verifikasi end-to-end & push

- [ ] **Step 1: Full build**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: semua PASS.

- [ ] **Step 2: Smoke test alur lengkap**

`pnpm dev`, lalu:
- Landing: harga 199k coret → 99k benar.
- `/checkout`: lewati 3 step, pilih kombinasi VIP+bonus, sampai redirect Tripay (atau sampai tombol "Bayar Sekarang" memanggil create tanpa error di console/network).
- Cek payload `/api/payment/create` mengandung `vip`/`bonus` dan response `checkout_url` ada.

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-Review (penulis plan)

- **Spec coverage:** Harga 99k (T1,T3) ✓ · VIP flag+fulfillment (T2,T5,T6,T8) ✓ · bump produk admin+grant (T2,T5,T7,T9) ✓ · wizard 3-step (T9,T10) ✓ · fee dinamis (T4,T5,T10) ✓ · keamanan harga server-side (T5) ✓.
- **Placeholder scan:** Tidak ada TODO/TBD; semua step berisi kode konkret. `[Judul Ebook]` di copy diisi runtime dari `bumpProduct.title`.
- **Type consistency:** `BumpProduct` didefinisikan di `checkout/page.tsx` (T9) & diimpor di `CheckoutForm` (T10). `VIP_UPSELL_PRICE` (T1) dipakai di T5 & T10. Field `vip`/`bonus` konsisten antara T5 (server) & T10 (client). `metadata.vip` (T5) dibaca di T6. `ebook_ids` (T5) diproses webhook existing.
