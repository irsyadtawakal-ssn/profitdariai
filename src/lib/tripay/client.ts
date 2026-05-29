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
  // .trim() penting — PowerShell echo tambah \n saat set env var, bisa corrupt signature
  const privateKey = process.env.TRIPAY_PRIVATE_KEY!.trim()
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE!.trim()
  return crypto
    .createHmac('sha256', privateKey)
    .update(merchantCode + merchantRef + amount)
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

export interface TripayChannel {
  group: string
  code: string
  name: string
  type: string
  icon_url: string
  active: boolean
}

export async function getPaymentChannels(): Promise<{ success: boolean; data: TripayChannel[] }> {
  const res = await fetch(`${getBaseUrl()}/merchant/payment-channel`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })
  return res.json()
}

export interface TripayFeeData {
  code: string
  name: string
  fee: { flat: number; percent: string; min: number | null; max: number | null }
  total_fee: { merchant: number; customer: number }
}

export async function getFeeCalculator(
  code: string,
  amount: number
): Promise<{ success: boolean; data: TripayFeeData }> {
  const params = new URLSearchParams({ code, amount: String(amount) })
  const res = await fetch(`${getBaseUrl()}/merchant/fee-calculator?${params}`, {
    headers: getHeaders(),
    cache: 'no-store',
  })
  return res.json()
}

/** Hitung total yang harus dibayar customer (base + fee customer dari Tripay) */
export function calculateTotal(amount: number, fee: TripayFeeData): number {
  return amount + fee.total_fee.customer
}

/** Hitung nilai fee customer saja */
export function calculateFee(amount: number, fee: TripayFeeData): number {
  return fee.total_fee.customer
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
