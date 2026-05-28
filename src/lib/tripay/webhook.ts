import crypto from 'crypto'

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  // .trim() penting — PowerShell echo tambah \n saat set env var
  const expected = crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!.trim())
    .update(rawBody)
    .digest()
  try {
    const sigBuffer = Buffer.from(signature, 'hex')
    if (sigBuffer.length !== expected.length) return false
    return crypto.timingSafeEqual(expected, sigBuffer)
  } catch {
    return false
  }
}

export interface TripayWebhookPayload {
  reference: string
  merchant_ref: string
  payment_method: string
  payment_method_code: string
  total_amount: number
  fee_merchant: number
  fee_customer: number
  total_fee: number
  amount_received: number
  is_closed_payment: number
  status: 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUND'
  paid_at: number | null
  note: string
}
