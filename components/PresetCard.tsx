'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { Preset } from '@/types/database'

interface PresetCardProps {
  preset: Preset
  onQuickPreview?: (preset: Preset) => void
  className?: string
}

export function PresetCard({ preset, onQuickPreview, className }: PresetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div
      className={cn(
        'group relative bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/50',
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
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              Quick Preview
            </button>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted(!isWishlisted)
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

        {/* Category badge */}
        {preset.category && (
          <div className="absolute top-2 left-2 text-xs font-medium text-[#888891] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded capitalize">
            {preset.category}
          </div>
        )}
      </Link>

      {/* Card content */}
      <div className="p-4">
        <Link href={`/preset/${preset.id}`}>
          <h3 className="font-semibold text-[#f0f0f0] truncate hover:text-white transition-colors mb-1">
            {preset.title}
          </h3>
        </Link>

        {preset.profiles && (
          <Link
            href={`/seller/${preset.profiles.username}`}
            className="text-sm text-[#888891] hover:text-[#f0f0f0] transition-colors truncate block mb-2"
          >
            {preset.profiles.display_name || preset.profiles.username}
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-[#888891]">
              {preset.rating_avg > 0 ? preset.rating_avg.toFixed(1) : 'New'}
              {preset.rating_count > 0 && (
                <span className="text-xs ml-1">({preset.rating_count})</span>
              )}
            </span>
          </div>
          <span className="font-mono font-semibold text-[#f0f0f0]">
            {formatPrice(preset.price_cents)}
          </span>
        </div>
      </div>
    </div>
  )
}
