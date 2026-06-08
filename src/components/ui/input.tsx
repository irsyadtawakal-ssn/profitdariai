import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-none border bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#888888]',
          'transition-all duration-200 outline-none',
          'focus:border-[#D4AF37] focus:ring-[3px] focus:ring-[rgba(212,175,55,0.1)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A] [&:-webkit-autofill]:[color:#F5F5F0] [&:-webkit-autofill]:[-webkit-text-fill-color:#F5F5F0]',
          error
            ? 'border-[#EF4444] ring-[3px] ring-[rgba(239,68,68,0.1)]'
            : 'border-[#2A2A2A]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
