import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[#7c5cfc]/30 bg-[#7c5cfc]/10 text-[#7c5cfc]',
        secondary:
          'border-white/10 bg-white/5 text-[#888891]',
        destructive:
          'border-red-500/30 bg-red-500/10 text-red-400',
        outline:
          'border-white/10 text-[#888891]',
        coral:
          'border-[#e05c7a]/30 bg-[#e05c7a]/10 text-[#e05c7a]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
