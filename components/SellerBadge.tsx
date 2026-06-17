import React from 'react'
import { BadgeCheck, Award, Rocket } from 'lucide-react'
import { cn, getSellerBadge } from '@/lib/utils'

interface SellerBadgeProps {
  profile?: { is_founder?: boolean | null; is_verified?: boolean | null; total_sales?: number | null } | null
  showLabel?: boolean
  className?: string
}

const STYLES = {
  founder: { Icon: Rocket, label: 'Founder', color: 'text-[#7c5cfc]', pill: 'border-[#7c5cfc]/30 bg-[#7c5cfc]/10 text-[#7c5cfc]' },
  verified: { Icon: BadgeCheck, label: 'Verified', color: 'text-[#3b9eff]', pill: 'border-[#3b9eff]/30 bg-[#3b9eff]/10 text-[#3b9eff]' },
  top: { Icon: Award, label: 'Top Seller', color: 'text-amber-400', pill: 'border-amber-400/30 bg-amber-400/10 text-amber-400' },
} as const

/**
 * Trust badge for a seller: a Founder rocket, a verified blue check, or a
 * top-seller award. Renders nothing if the seller has earned none.
 */
export function SellerBadge({ profile, showLabel = false, className }: SellerBadgeProps) {
  const badge = getSellerBadge(profile)
  if (!badge) return null

  const { Icon, label, color, pill } = STYLES[badge]

  if (!showLabel) {
    return (
      <span title={label} className={cn('inline-flex flex-shrink-0', color, className)}>
        <Icon className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', pill, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
