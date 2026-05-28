export function paymentSuccessEmail(name: string, expiresAt: string) {
  const expiry = new Date(expiresAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return {
    subject: '🎉 Selamat! Membership kamu aktif sekarang',
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
        Membership kamu sudah aktif. Kamu sekarang punya akses penuh ke semua kursus dan ebook di Profit dari AI.
      </p>
      <div style="background:#1A1A1A;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #D4AF37">
        <p style="color:#888888;font-size:13px;margin:0 0 4px">Masa aktif hingga</p>
        <p style="color:#F5F5F0;font-size:18px;font-weight:600;margin:0">${expiry}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
        style="display:block;background:#D4AF37;color:#0A0A0A;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px">
        Mulai Belajar →
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

export function renewalReminderEmail(name: string, expiresAt: string) {
  const expiry = new Date(expiresAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return {
    subject: '⚠️ Membership kamu akan segera berakhir',
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
        Membership kamu akan berakhir pada <strong style="color:#F5F5F0">${expiry}</strong>.
        Perpanjang sekarang agar akses ke semua kursus dan ebook tetap aktif.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
        style="display:block;background:#D4AF37;color:#0A0A0A;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px">
        Perpanjang Membership →
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
