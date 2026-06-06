import type { Metadata } from 'next'
import { Sora, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-hanken',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Profit Dari AI',
    template: '%s | Profit Dari AI',
  },
  description:
    'Platform membership eksklusif untuk kursus & ebook monetisasi AI. Bergabung dengan ribuan member yang sudah cuan dari AI.',
  keywords: ['AI', 'kursus AI', 'ebook AI', 'monetisasi AI', 'side income', 'Indonesia'],
  authors: [{ name: 'Profit Dari AI' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://profitdariai.com',
    siteName: 'Profit Dari AI',
    title: 'Profit Dari AI',
    description:
      'Platform membership eksklusif untuk kursus & ebook monetisasi AI di Indonesia.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profit Dari AI',
    description: 'Platform membership eksklusif untuk kursus & ebook monetisasi AI di Indonesia.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sora.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#F5F5F0',
            },
          }}
        />
      </body>
    </html>
  )
}
