import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-[#888891] focus:outline-none focus:ring-2 focus:ring-[#7c5cfc]/50 focus:border-[#7c5cfc]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
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
