import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#7c5cfc] text-white hover:bg-[#6b4de8] shadow-lg shadow-[#7c5cfc]/20',
        destructive:
          'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
        outline:
          'border border-white/10 bg-white/5 text-[#f0f0f0] hover:bg-white/10 hover:border-white/20',
        secondary:
          'bg-white/5 text-[#f0f0f0] hover:bg-white/10',
        ghost:
          'text-[#888891] hover:text-[#f0f0f0] hover:bg-white/5',
        link:
          'text-[#7c5cfc] underline-offset-4 hover:underline p-0 h-auto',
        coral:
          'bg-[#e05c7a] text-white hover:bg-[#cc4d6a] shadow-lg shadow-[#e05c7a]/20',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-13 px-8 py-4 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
