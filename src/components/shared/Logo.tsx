// src/components/shared/Logo.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function Logo({ className, size = 'md', href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'font-bold text-[#D4AF37] tracking-tight hover:opacity-80 transition-opacity',
        sizeMap[size],
        className
      )}
    >
      profitdariai
    </Link>
  )
}
