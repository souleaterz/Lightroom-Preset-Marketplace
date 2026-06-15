import React from 'react'
import { BadgeCheck, Award } from 'lucide-react'
import { cn, getSellerBadge } from '@/lib/utils'

interface SellerBadgeProps {
  profile?: { is_verified?: boolean | null; total_sales?: number | null } | null
  showLabel?: boolean
  className?: string
}

/**
 * Trust badge for a seller: a blue check for verified accounts, an amber award
 * for top sellers. Renders nothing if the seller has earned neither.
 */
export function SellerBadge({ profile, showLabel = false, className }: SellerBadgeProps) {
  const badge = getSellerBadge(profile)
  if (!badge) return null

  const verified = badge === 'verified'
  const Icon = verified ? BadgeCheck : Award
  const label = verified ? 'Verified' : 'Top Seller'
  const color = verified ? 'text-[#3b9eff]' : 'text-amber-400'

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
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        verified ? 'border-[#3b9eff]/30 bg-[#3b9eff]/10 text-[#3b9eff]' : 'border-amber-400/30 bg-amber-400/10 text-amber-400',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
