import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-geist' })

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} min-h-screen flex items-center justify-center bg-[#0A0A0A]`}>
      {children}
    </div>
  )
}
