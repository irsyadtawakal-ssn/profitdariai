import { unstable_cache, revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const SETTINGS_TAG = 'site-settings'

/**
 * Ambil semua site settings sebagai map key→value.
 * Di-cache (tag `site-settings`) — di-bust oleh `saveSettings` saat admin menyimpan.
 * Server-only: dipanggil dari server component / server action saja.
 */
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const supabase = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value')
    if (error) {
      console.error('[getSettings]', error.message)
      return {}
    }
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value ?? ''
    return map
  },
  ['site-settings'],
  { tags: [SETTINGS_TAG], revalidate: 300 }
)

/** Ambil satu setting. Fallback ke env var kalau DB kosong. */
export async function getSetting(key: string, envFallback?: string): Promise<string> {
  const settings = await getSettings()
  return settings[key] || envFallback || ''
}

/** Upsert beberapa setting sekaligus, lalu bust cache. Caller wajib sudah cek admin. */
export async function setSettings(values: Record<string, string>): Promise<void> {
  const supabase = createAdminClient()
  const rows = Object.entries(values).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' })
  if (error) {
    console.error('[setSettings]', error.message)
    throw new Error(error.message)
  }
  // Bust cache root layout (pixel) + halaman admin pengaturan.
  revalidatePath('/', 'layout')
  revalidatePath('/admin/pengaturan')
}
