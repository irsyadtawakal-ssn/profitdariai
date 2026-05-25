import crypto from 'crypto'

const BASE_URL = {
  sandbox: 'https://tripay.co.id/api-sandbox',
  production: 'https://tripay.co.id/api',
}

function getBaseUrl() {
  return BASE_URL[process.env.TRIPAY_MODE as 'sandbox' | 'production'] ?? BASE_URL.sandbox
}

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export function createSignature(merchantRef: string, amount: number): string {
  return crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!)
    .update(process.env.TRIPAY_MERCHANT_CODE! + merchantRef + amount)
    .digest('hex')
}

export async function createTransaction(payload: TripayCreatePayload) {
  const res = await fetch(`${getBaseUrl()}/transaction/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  return res.json() as Promise<TripayCreateResponse>
}

export async function getPaymentChannels() {
  const res = await fetch(`${getBaseUrl()}/merchant/payment-channel`, {
    headers: getHeaders(),
  })
  return res.json()
}

export interface TripayCreatePayload {
  method: string
  merchant_ref: string
  amount: number
  customer_name: string
  customer_email: string
  order_items: Array<{ sku: string; name: string; price: number; quantity: number }>
  return_url: string
  expired_time: number
  signature: string
}

export interface TripayCreateResponse {
  success: boolean
  message: string
  data: {
    reference: string
    checkout_url: string
    qr_url?: string
    pay_code?: string
    expired_time: number
  }
}
