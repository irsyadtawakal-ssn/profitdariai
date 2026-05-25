import crypto from 'crypto'

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!)
    .update(rawBody)
    .digest('hex')
  return expected === signature
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
