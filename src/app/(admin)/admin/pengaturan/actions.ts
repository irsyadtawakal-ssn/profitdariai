'use server'

import { requireAdmin } from '@/lib/auth/requireAdmin'
import { setSettings, getSettings as getSettingsDb } from '@/lib/settings'

export async function getSettings() {
  await requireAdmin()
  return await getSettingsDb()
}

export async function savePixelSettings(formData: FormData) {
  await requireAdmin()

  const pixelId = ((formData.get('meta_pixel_id') as string) ?? '').trim()
  const capiToken = ((formData.get('meta_capi_token') as string) ?? '').trim()

  // Pixel ID harus angka (kalau diisi)
  if (pixelId && !/^\d{5,20}$/.test(pixelId)) {
    throw new Error('Pixel ID tidak valid — harus berupa angka (5–20 digit).')
  }

  await setSettings({
    meta_pixel_id: pixelId,
    meta_capi_token: capiToken,
  })
}
