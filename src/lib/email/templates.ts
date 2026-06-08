export function purchaseConfirmationEmail(name: string, productTitle: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://profitdariai.com'

  return {
    subject: `🎉 Pembelian berhasil! ${productTitle} sudah aktif`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222222">
    <div style="background:#D4AF37;padding:32px;text-align:center">
      <h1 style="margin:0;color:#0A0A0A;font-size:24px;font-weight:700">Profit dari AI</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px">Hei ${name}! 👋</h2>
      <p style="color:#AAAAAA;line-height:1.6;margin:0 0 24px">
        Pembelian kamu sudah dikonfirmasi. Produk berikut sudah ditambahkan ke library kamu:
      </p>
      <div style="background:#1A1A1A;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #D4AF37">
        <p style="color:#888888;font-size:13px;margin:0 0 4px">Produk</p>
        <p style="color:#F5F5F0;font-size:18px;font-weight:600;margin:0">${productTitle}</p>
      </div>
      <a href="${appUrl}/materi"
        style="display:block;background:#D4AF37;color:#0A0A0A;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px">
        Buka Library →
      </a>
    </div>
    <div style="padding:24px 32px;border-top:1px solid #222222">
      <p style="color:#555555;font-size:12px;margin:0;text-align:center">
        Ada pertanyaan? Balas email ini atau hubungi kami di admin@profitdariai.com
      </p>
    </div>
  </div>
</body>
</html>`,
  }
}

export function marketplacePurchaseEmail(name: string, productTitle: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://profitdariai.com'

  return {
    subject: `🎉 Pembelian berhasil! ${productTitle} sudah aktif`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222222">
    <div style="background:#D4AF37;padding:32px;text-align:center">
      <h1 style="margin:0;color:#0A0A0A;font-size:24px;font-weight:700">Profit dari AI</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px">Hei ${name}! 👋</h2>
      <p style="color:#AAAAAA;line-height:1.6;margin:0 0 24px">
        Pembelian kamu sudah dikonfirmasi. Produk berikut sudah tersedia di library kamu:
      </p>
      <div style="background:#1A1A1A;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #D4AF37">
        <p style="color:#888888;font-size:13px;margin:0 0 4px">Produk</p>
        <p style="color:#F5F5F0;font-size:18px;font-weight:600;margin:0">${productTitle}</p>
      </div>
      <a href="${appUrl}/ebook"
        style="display:block;background:#D4AF37;color:#0A0A0A;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px">
        Buka Library →
      </a>
    </div>
    <div style="padding:24px 32px;border-top:1px solid #222222">
      <p style="color:#555555;font-size:12px;margin:0;text-align:center">
        Ada pertanyaan? Balas email ini atau hubungi kami di admin@profitdariai.com
      </p>
    </div>
  </div>
</body>
</html>`,
  }
}

/**
 * @deprecated — renewal system removed. Kept for reference only.
 */
export function paymentSuccessEmail(name: string, _expiresAt: string) {
  return purchaseConfirmationEmail(name, 'Profit Dari AI (E-book)')
}
