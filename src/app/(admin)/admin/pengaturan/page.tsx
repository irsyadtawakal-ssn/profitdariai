import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getSettings } from '@/lib/settings'
import { PengaturanForm } from './PengaturanForm'

export const metadata = { title: 'Pengaturan' }

export default async function PengaturanPage() {
  await requireAdmin()
  const settings = await getSettings()

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-mono text-xs text-[#888888] uppercase tracking-[0.15em] mb-1">Pengaturan</h1>
        <h2 className="text-2xl font-bold text-ivory">Tracking & Pixel</h2>
        <p className="text-sm text-[#888888] mt-2">
          Konfigurasi Meta Pixel untuk tracking konversi iklan Facebook & Instagram.
        </p>
      </header>

      <section className="border border-gold/20 bg-[#0E0E0E]/60 p-6 md:p-8 cyber-corner">
        <h3 className="font-mono text-sm text-gold uppercase tracking-wider mb-6">Meta (Facebook) Pixel</h3>
        <PengaturanForm
          pixelId={settings.meta_pixel_id ?? ''}
          capiToken={settings.meta_capi_token ?? ''}
        />
      </section>
    </div>
  )
}
