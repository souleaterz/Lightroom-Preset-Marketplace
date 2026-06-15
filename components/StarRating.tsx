'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarRating({ value, max = 5, onChange, size = 'md', className }: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0)

  const sizeClass = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => onChange && setHovered(star)}
            onMouseLeave={() => onChange && setHovered(0)}
            className={cn(
              'transition-colors',
              onChange ? 'cursor-pointer' : 'cursor-default'
            )}
            disabled={!onChange}
          >
            <Star
              className={cn(
                sizeClass,
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
