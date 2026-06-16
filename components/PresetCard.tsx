'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart } from 'lucide-react'
import { cn, isDemoPreset, isBundle } from '@/lib/utils'
import { categoryLabel } from '@/lib/categories'
import { SellerBadge } from '@/components/SellerBadge'
import { Price } from '@/components/Price'
import { useWishlist } from '@/components/WishlistProvider'
import type { Preset } from '@/types/database'

interface PresetCardProps {
  preset: Preset
  onQuickPreview?: (preset: Preset) => void
  className?: string
}

export function PresetCard({ preset, onQuickPreview, className }: PresetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { isWishlisted: checkWishlisted, toggle } = useWishlist()
  const isWishlisted = checkWishlisted(preset.id)
  const demo = isDemoPreset(preset)
  const bundle = isBundle(preset)

  return (
    <div
      className={cn(
        'group relative bg-surface border border-line rounded-xl overflow-hidden transition-all duration-300 hover:border-line-strong hover:shadow-xl hover:shadow-black/50',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image area with crossfade */}
      <Link href={`/preset/${preset.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={preset.before_image_url}
          alt={`${preset.title} - Before`}
          fill
          className={cn(
            'object-cover transition-opacity duration-500',
            isHovered ? 'opacity-0' : 'opacity-100'
          )}
        />
        <Image
          src={preset.after_image_url}
          alt={`${preset.title} - After`}
          fill
          className={cn(
            'object-cover transition-opacity duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Demo watermark */}
        {demo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span
              className="font-extrabold tracking-[0.2em] text-white/75 text-4xl -rotate-12 select-none"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            >
              DEMO
            </span>
          </div>
        )}

        {/* Before/After labels */}
        <div className={cn(
          'absolute bottom-2 left-2 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded transition-opacity duration-300',
          isHovered ? 'opacity-0' : 'opacity-100'
        )}>
          Before
        </div>
        <div className={cn(
          'absolute bottom-2 right-2 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          After
        </div>

        {/* Quick preview button */}
        {onQuickPreview && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickPreview(preset)
              }}
              className="bg-overlay-strong backdrop-blur-sm border border-line-strong text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              Quick Preview
            </button>
          </div>
        )}

        {/* Wishlist button */}
        <button
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggle(preset.id)
          }}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all duration-200',
            isWishlisted
              ? 'bg-[#e05c7a]/20 text-[#e05c7a]'
              : 'bg-black/40 text-white/60 opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart className={cn('h-4 w-4', isWishlisted && 'fill-[#e05c7a]')} />
        </button>

        {/* Category / bundle badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {bundle && (
            <span className="text-xs font-semibold text-white bg-[#7c5cfc] px-2 py-0.5 rounded">
              Bundle · {preset.bundle_preset_ids?.length}
            </span>
          )}
          {preset.category && (
            <span className="text-xs font-medium text-muted bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
              {categoryLabel(preset.category)}
            </span>
          )}
        </div>
      </Link>

      {/* Card content */}
      <div className="p-4">
        <Link href={`/preset/${preset.id}`}>
          <h3 className="font-semibold text-foreground truncate hover:text-white transition-colors mb-1">
            {preset.title}
          </h3>
        </Link>

        {preset.profiles && (
          <Link
            href={`/seller/${preset.profiles.username}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-2"
          >
            <span className="truncate">{preset.profiles.display_name || preset.profiles.username}</span>
            <SellerBadge profile={preset.profiles} />
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted">
              {preset.rating_avg > 0 ? preset.rating_avg.toFixed(1) : 'New'}
              {preset.rating_count > 0 && (
                <span className="text-xs ml-1">({preset.rating_count})</span>
              )}
            </span>
          </div>
          <Price
            gbpPence={preset.price_cents}
            className={cn(
              'font-mono font-semibold',
              preset.price_cents <= 0 ? 'text-[#7c5cfc]' : 'text-foreground'
            )}
          />
        </div>
      </div>
    </div>
  )
}
