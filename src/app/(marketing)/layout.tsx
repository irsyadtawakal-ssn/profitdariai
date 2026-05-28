import { Geist, JetBrains_Mono } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-geist' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-jetbrains' })

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${geist.variable} ${jetbrainsMono.variable}`}>{children}</div>
}
