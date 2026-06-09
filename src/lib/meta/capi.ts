import crypto from 'crypto'
import { getSetting } from '@/lib/settings'

const GRAPH_VERSION = 'v21.0'

/** SHA-256 hash (lowercase, trimmed) sesuai syarat Meta untuk PII. */
function hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

interface PurchaseEvent {
  /** Untuk dedup dengan event pixel browser — pakai merchant_ref. */
  eventId: string
  email?: string | null
  value: number
  currency?: string
  eventSourceUrl?: string
  clientIp?: string | null
  userAgent?: string | null
  /** Cookie _fbp / _fbc kalau tersedia (boost match quality). */
  fbp?: string | null
  fbc?: string | null
}

/**
 * Kirim event Purchase ke Meta Conversions API (server-side, autoritatif).
 * Membaca pixel_id + token dari site_settings (fallback env). No-op kalau belum dikonfigurasi.
 * Tidak pernah throw — kegagalan tracking tidak boleh menggagalkan webhook pembayaran.
 */
export async function sendPurchaseEvent(event: PurchaseEvent): Promise<void> {
  try {
    const pixelId = await getSetting('meta_pixel_id', process.env.NEXT_PUBLIC_FB_PIXEL_ID)
    const token = await getSetting('meta_capi_token', process.env.META_CAPI_TOKEN)
    if (!pixelId || !token) return

    const userData: Record<string, unknown> = {}
    if (event.email) userData.em = [hash(event.email)]
    if (event.clientIp) userData.client_ip_address = event.clientIp
    if (event.userAgent) userData.client_user_agent = event.userAgent
    if (event.fbp) userData.fbp = event.fbp
    if (event.fbc) userData.fbc = event.fbc

    const body = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.eventId,
          action_source: 'website',
          event_source_url: event.eventSourceUrl,
          user_data: userData,
          custom_data: {
            currency: event.currency ?? 'IDR',
            value: event.value,
          },
        },
      ],
    }

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error(`[meta-capi] Purchase event failed (${res.status}):`, txt)
    }
  } catch (error) {
    console.error('[meta-capi] sendPurchaseEvent threw:', error)
  }
}
