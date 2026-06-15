'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/types/database'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'best_rated', label: 'Best Rated' },
  { value: 'most_popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
]

export function FilterSidebar() {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const category = params.get('category') || 'all'
  const minPrice = params.get('min_price') || '0'
  const maxPrice = params.get('max_price') || '100'
  const minRating = params.get('min_rating') || ''
  const sort = params.get('sort') || 'newest'

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString())
    if (value === '' || value === 'all' || (key === 'min_price' && value === '0') || (key === 'max_price' && value === '100')) {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    p.delete('page')
    router.push(`/browse?${p.toString()}`)
  }

  const clear = () => {
    router.push('/browse')
  }

  const hasFilters = category !== 'all' || minPrice !== '0' || maxPrice !== '100' || minRating || sort !== 'newest'

  const sidebar = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sort by</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('sort', opt.value)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                sort === opt.value
                  ? 'bg-[#7c5cfc]/15 text-[#7c5cfc]'
                  : 'text-muted hover:text-foreground hover:bg-overlay'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => update('category', cat.value)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                category === cat.value
                  ? 'bg-[#7c5cfc]/15 text-[#7c5cfc]'
                  : 'text-muted hover:text-foreground hover:bg-overlay'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Price: £{minPrice} – £{maxPrice}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted w-8">Min</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minPrice}
              onChange={(e) => update('min_price', e.target.value)}
              className="flex-1 accent-[#7c5cfc]"
            />
            <span className="text-xs text-muted w-8 text-right">£{minPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted w-8">Max</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={maxPrice}
              onChange={(e) => update('max_price', e.target.value)}
              className="flex-1 accent-[#7c5cfc]"
            />
            <span className="text-xs text-muted w-8 text-right">£{maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Min Rating</h3>
        <div className="space-y-1">
          {[
            { value: '', label: 'Any' },
            { value: '3', label: '3★ & above' },
            { value: '4', label: '4★ & above' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('min_rating', opt.value)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                minRating === opt.value
                  ? 'bg-[#7c5cfc]/15 text-[#7c5cfc]'
                  : 'text-muted hover:text-foreground hover:bg-overlay'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="w-full text-muted">
          <X className="h-3.5 w-3.5 mr-1.5" />
          Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile top bar: full-width filters button + quick category chips */}
      <div className="lg:hidden mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="flex-shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasFilters && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-[#7c5cfc] text-white text-xs flex items-center justify-center">
                {[category !== 'all', maxPrice !== '100', !!minRating, sort !== 'newest'].filter(Boolean).length}
              </span>
            )}
          </Button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => update('category', cat.value)}
              className={cn(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm transition-all border',
                category === cat.value
                  ? 'bg-[#7c5cfc]/15 text-[#7c5cfc] border-[#7c5cfc]/30'
                  : 'text-muted border-line hover:text-foreground hover:border-line-strong'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <div className="relative ml-auto w-72 bg-surface border-l border-line p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-foreground">Filters</h2>
                <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
