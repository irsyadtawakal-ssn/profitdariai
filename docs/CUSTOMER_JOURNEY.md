# Customer Journey — profitdariai

## 1. Landing Page Discovery
- **Route:** `/` (marketing)
- **Content:**
  - Hero: "Cara Hasilkan Rp 74 Juta dari Produk Digital Buatan AI"
  - Topbar: "EARLY BIRD — Akses Lifetime Rp 199K"
  - CTAs: "Ya, Saya Mau Mulai Sekarang!" → `/signup`
  - Proof: Ticker (Rp 74.7M omzet, 1.494 orders, 20.53% conversion)
  - Course outline, testimonials, FAQ
  - Final CTA: "🚀 Mulai Sekarang — Rp 199.000 Lifetime"

**Key Decision:** User decides to buy membership

---

## 2. Signup / Login
- **Route:** `/signup` (auth) or `/login` (if returning user)
- **Actions:**
  - New user: Create account (email + password)
  - Existing user: Sign in
  - System creates profile with role='member', membership_expires_at=NULL
- **After Auth:** Redirect to `/member/checkout`

---

## 3. Checkout Page
- **Route:** `/member/checkout` (protected, member-only)
- **Guards:**
  - If not logged in → redirect to `/login`
  - If membership already active → redirect to `/dashboard`
- **Content:**
  - Order summary: "profitdariai Membership Lifetime — Rp 199.000"
  - Payment method selection:
    - QRIS (all e-wallets & m-banking)
    - OVO, Dana, ShopeePay
    - BCA, Mandiri, BNI, BRI Virtual Accounts
  - "Bayar Sekarang" button
  - Trust signals: "SSL Aman · 7 Hari Uang Kembali · Diproses via Tripay"

**Key Decision:** User selects payment method and clicks "Bayar Sekarang"

---

## 4. Payment Initiation
- **API Endpoint:** `POST /api/payment/create`
- **Request:**
  ```json
  {
    "paymentMethod": "QRIS" // or OVO, BCAVA, etc.
  }
  ```
- **Backend Actions:**
  1. Verify user is authenticated
  2. Generate merchant reference: `{user_id}-{timestamp}`
  3. Calculate signature: HMAC-SHA256(merchant_code + merchant_ref + amount, private_key)
  4. Call Tripay API: `POST /transaction/create`
  5. Insert transaction record in DB (status=UNPAID)
  6. Return checkout_url, qr_url, pay_code to frontend

**Response:**
```json
{
  "checkout_url": "https://tripay.co.id/checkout/...",
  "qr_url": "https://...",
  "pay_code": "..."
}
```

---

## 5. Tripay Checkout
- **Redirect:** User goes to `checkout_url` (Tripay hosted page)
- **User Actions:**
  - Confirm payment details (Rp 199.000)
  - Select exact payment method (e.g., "QRIS (GCash)")
  - Complete payment (scan QR, tap button, etc.)
- **Tripay Processing:**
  - Verifies payment with bank/e-wallet
  - Sends webhook callback to `/api/payment/webhook`

---

## 6. Payment Confirmation (Webhook)
- **Endpoint:** `POST /api/payment/webhook`
- **Tripay Callback:**
  ```json
  {
    "reference": "TRIPAY_REF_...",
    "merchant_ref": "USER_ID-...",
    "status": "PAID",
    "paid_at": 1685000000,
    "amount": 199000
  }
  ```
- **Backend Actions:**
  1. Verify webhook signature: HMAC-SHA256(rawBody, private_key) == header signature
  2. Find transaction by tripay_reference + merchant_ref
  3. Update transaction status → "PAID", paid_at
  4. **Query user profile**
  5. Update profile: membership_expires_at = "2099-12-31T23:59:59.000Z" (lifetime)
  6. Send payment success email to user
  7. Return `{success: true}` to Tripay

**Email Template:**
- Subject: "Pembayaran Berhasil — Selamat Datang di profitdariai!"
- Body: Confirms membership, shows expiry date, links to dashboard

---

## 7. Return to App
- **After Tripay Payment:**
  - Tripay redirects user to `TRIPAY_RETURN_URL`
  - Default: `https://profitdariai.com/dashboard?payment=success`
  - Local dev: `http://localhost:3000/payment/success`

- **Route:** `/member/payment/success`
- **Content:**
  - Success icon (animated checkmark)
  - "Pembayaran Berhasil!"
  - "Selamat datang di profitdariai. Akses kamu sudah aktif."
  - Shows: "Membership aktif sampai 31 Desember 2099"
  - Button: "Mulai Belajar →" → `/dashboard`

---

## 8. Member Dashboard
- **Route:** `/dashboard` (protected, membership required)
- **Guards:**
  - If not logged in → redirect to `/login`
  - If membership expired → redirect to `/checkout`
- **Content:**
  - Welcome message with user's name
  - Available courses (from DB)
  - Available ebooks (from DB)
  - Progress tracking
  - Profile settings

---

## 9. Ongoing — Renewal Reminder (Optional Future)
- **Cron Job:** Daily at 2am UTC
- **Trigger:** Profiles expiring in 7 days (±12 hour window)
- **Action:** Send renewal reminder email
- **Note:** Current model is lifetime, so this won't trigger. Will be useful if future model changes.

---

## 10. Admin Dashboard
- **Route:** `/admin/dashboard` (protected, role='admin' only)
- **Access:** After login, if role='admin', redirect here instead of `/dashboard`
- **Content:**
  - Dashboard overview
  - Course management (CRUD)
  - Ebook management (CRUD)
  - Member list + subscription status
  - Payment history

---

## Environment Variables

### Production (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://fnuydaowhneaqldhvufp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TRIPAY_MODE=production
TRIPAY_API_KEY=...
TRIPAY_PRIVATE_KEY=...
TRIPAY_MERCHANT_CODE=...
TRIPAY_CALLBACK_URL=https://profitdariai.com/api/payment/webhook
TRIPAY_RETURN_URL=https://profitdariai.com/dashboard?payment=success

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@profitdariai.com
SMTP_PASS=...

CRON_SECRET=...
SENTRY_DSN=...
```

### Local Development
```
TRIPAY_MODE=sandbox
TRIPAY_CALLBACK_URL=http://localhost:3000/api/payment/webhook
TRIPAY_RETURN_URL=http://localhost:3000/payment/success
```

---

## Testing Checklist

### Sandbox Test (TRIPAY_MODE=sandbox)
- [ ] User signs up
- [ ] Checkout page loads
- [ ] Select payment method (QRIS recommended for testing)
- [ ] Click "Bayar Sekarang"
- [ ] Redirected to Tripay sandbox checkout
- [ ] Complete payment (use test credentials)
- [ ] Webhook processed (check logs)
- [ ] Email sent (check Hostinger logs)
- [ ] Profile updated with membership_expires_at
- [ ] Redirected to `/payment/success`
- [ ] Button takes user to `/dashboard`
- [ ] Dashboard shows membership active

### Production Deployment
1. Set TRIPAY_MODE=production
2. Add production Tripay credentials to Vercel env vars
3. Deploy to production
4. Test with real payment
5. Verify email delivery

---

## Success Metrics

**Customer sees:**
1. ✅ Landing page with clear Rp 199K offer
2. ✅ Smooth signup/login flow
3. ✅ Checkout page with multiple payment options
4. ✅ Successful payment → confirmation email
5. ✅ Immediate access to all courses & ebooks
6. ✅ Dashboard with content visible

**Backend ensures:**
1. ✅ Payment verified via Tripay webhook signature
2. ✅ Transaction recorded in DB
3. ✅ Membership activated (lifetime)
4. ✅ Email sent successfully
5. ✅ User can access protected routes
6. ✅ Errors tracked in Sentry
7. ✅ Logs available for debugging
