import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cuan Dari AI',
    template: '%s | Cuan Dari AI',
  },
  description:
    'Platform membership eksklusif untuk kursus & ebook monetisasi AI. Bergabung dengan ribuan member yang sudah cuan dari AI.',
  keywords: ['AI', 'kursus AI', 'ebook AI', 'monetisasi AI', 'side income', 'Indonesia'],
  authors: [{ name: 'Cuan Dari AI' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://profitdariai.com',
    siteName: 'Cuan Dari AI',
    title: 'Cuan Dari AI',
    description:
      'Platform membership eksklusif untuk kursus & ebook monetisasi AI di Indonesia.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuan Dari AI',
    description: 'Platform membership eksklusif untuk kursus & ebook monetisasi AI di Indonesia.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} h-full`}>
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
