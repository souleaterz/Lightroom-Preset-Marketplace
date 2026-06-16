'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useCurrency } from '@/components/CurrencyProvider'
import { CURRENCIES, CURRENCY_CODES } from '@/lib/currency'
import { cn } from '@/lib/utils'

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-overlay transition-all"
        aria-label="Change currency"
      >
        <span className="font-medium">{CURRENCIES[currency].symbol}</span>
        <span className="text-xs">{currency}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-44 bg-surface border border-line rounded-xl shadow-2xl py-1 z-50 max-h-72 overflow-y-auto">
          {CURRENCY_CODES.map((code) => (
            <button
              key={code}
              onClick={() => { setCurrency(code); setOpen(false) }}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm transition-all',
                code === currency ? 'text-foreground bg-overlay' : 'text-muted hover:text-foreground hover:bg-overlay'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-left">{CURRENCIES[code].symbol}</span>
                <span>{code}</span>
              </span>
              {code === currency && <Check className="h-3.5 w-3.5 text-[#7c5cfc]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
