export type { Database } from './database'
export type { TripayCreatePayload, TripayCreateResponse } from '@/lib/tripay/client'
export type { TripayWebhookPayload } from '@/lib/tripay/webhook'

export type PaymentMethod =
  | 'QRIS'
  | 'OVO'
  | 'DANA'
  | 'SHOPEEPAY'
  | 'BCAVA'
  | 'MANDIRIVA'
  | 'BNIVA'
  | 'BRIVA'

export interface PaymentMethodOption {
  code: PaymentMethod
  name: string
  fee: string
  type: 'ewallet' | 'va' | 'qris'
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { code: 'QRIS', name: 'QRIS', fee: '0.7%', type: 'qris' },
  { code: 'OVO', name: 'OVO', fee: '1.5%', type: 'ewallet' },
  { code: 'DANA', name: 'Dana', fee: '1.5%', type: 'ewallet' },
  { code: 'SHOPEEPAY', name: 'ShopeePay', fee: '2%', type: 'ewallet' },
  { code: 'BCAVA', name: 'BCA Virtual Account', fee: 'Rp 4.000', type: 'va' },
  { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', fee: 'Rp 4.000', type: 'va' },
  { code: 'BNIVA', name: 'BNI Virtual Account', fee: 'Rp 4.000', type: 'va' },
  { code: 'BRIVA', name: 'BRI Virtual Account', fee: 'Rp 4.000', type: 'va' },
]

export const MEMBERSHIP_PRICE = 999_000
export const MEMBERSHIP_EARLY_BIRD_PRICE = 99_000
export const VIP_UPSELL_PRICE = 50_000
export const MEMBERSHIP_LIFETIME_EXPIRY = '2099-12-31T23:59:59.000Z'
