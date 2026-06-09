'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { savePixelSettings } from './actions'

interface Props {
  pixelId: string
  capiToken: string
}

/** Mask token panjang: tampilkan 6 char awal + akhir. */
function maskToken(token: string) {
  if (!token) return ''
  if (token.length <= 14) return token
  return `${token.slice(0, 6)}…${token.slice(-4)}`
}

export function PengaturanForm({ pixelId, capiToken }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showToken, setShowToken] = useState(false)
  const hasToken = capiToken.length > 0

  function action(formData: FormData) {
    // Kalau field token dikosongkan tapi sudah ada token tersimpan & user tidak mengetik,
    // pakai placeholder masked → jangan timpa. Di sini: kalau value === masked, kirim token asli.
    const typed = (formData.get('meta_capi_token') as string) ?? ''
    if (hasToken && typed === maskToken(capiToken)) {
      formData.set('meta_capi_token', capiToken)
    }
    startTransition(async () => {
      try {
        await savePixelSettings(formData)
        toast.success('Pengaturan Pixel tersimpan')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
      }
    })
  }

  return (
    <form action={action} className="max-w-2xl space-y-8">
      <div className="space-y-2">
        <label htmlFor="meta_pixel_id" className="font-mono text-xs uppercase tracking-wider text-gold">
          Meta Pixel ID
        </label>
        <Input
          id="meta_pixel_id"
          name="meta_pixel_id"
          defaultValue={pixelId}
          placeholder="542494555488681"
          inputMode="numeric"
        />
        <p className="text-xs text-[#888888]">
          Ambil dari Meta Events Manager → Data Sources. Angka ±15 digit. Kosongkan untuk menonaktifkan pixel.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="meta_capi_token" className="font-mono text-xs uppercase tracking-wider text-gold">
          Conversions API Token
        </label>
        <Input
          id="meta_capi_token"
          name="meta_capi_token"
          type={showToken ? 'text' : 'password'}
          defaultValue={hasToken ? maskToken(capiToken) : ''}
          placeholder="EAAxxxxx… (access token CAPI)"
          autoComplete="off"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#888888]">
            Token server-side untuk Conversions API. Disimpan terenkripsi di server, tidak pernah diekspos ke browser.
          </p>
          <button
            type="button"
            onClick={() => setShowToken((s) => !s)}
            className="font-mono text-[10px] uppercase tracking-wider text-[#888888] hover:text-gold shrink-0"
          >
            {showToken ? 'Sembunyikan' : 'Lihat'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-gold text-obsidian font-mono text-xs font-bold py-3 px-8 cyber-corner hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {isPending ? 'MENYIMPAN…' : 'SIMPAN PENGATURAN'}
      </button>
    </form>
  )
}
