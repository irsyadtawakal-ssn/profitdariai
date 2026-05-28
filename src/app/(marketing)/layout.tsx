import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={outfit.className}>{children}</div>
}
