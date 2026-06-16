'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, Check, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Price } from '@/components/Price'
import { useCurrency } from '@/components/CurrencyProvider'
import { formatPrice } from '@/lib/utils'
import type { Preset } from '@/types/database'

interface PurchaseButtonProps {
  preset: Preset
}

export function PurchaseButton({ preset }: PurchaseButtonProps) {
  const router = useRouter()
  const { isConverted } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discount code state
  const [showCode, setShowCode] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [applied, setApplied] = useState<{ code: string; discountedCents: number; percentOff: number } | null>(null)

  const effectivePrice = applied ? applied.discountedCents : preset.price_cents

  const applyCode = async () => {
    const code = codeInput.trim()
    if (!code) return
    setApplying(true)
    setCodeError(null)
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: preset.id, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/signin?next=/preset/' + preset.id)
          return
        }
        throw new Error(data.error || 'Invalid code')
      }
      setApplied({ code: code.toUpperCase(), discountedCents: data.discounted_cents, percentOff: data.percent_off })
    } catch (err: unknown) {
      setApplied(null)
      setCodeError((err as Error).message)
    } finally {
      setApplying(false)
    }
  }

  const removeCode = () => {
    setApplied(null)
    setCodeInput('')
    setCodeError(null)
  }

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: preset.id, code: applied?.code }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/signin?next=/preset/' + preset.id)
          return
        }
        throw new Error(data.error || 'Failed to start checkout')
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Buy now — <Price gbpPence={effectivePrice} />
          </>
        )}
      </Button>
      {isConverted && (
        <p className="text-xs text-center text-muted">
          Billed in GBP ({formatPrice(effectivePrice)}) · prices shown in your currency are estimates
        </p>
      )}

      {/* Discount code */}
      {applied ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5 text-green-400 min-w-0">
            <Check className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-mono truncate">{applied.code}</span>
            <span className="text-muted">−{applied.percentOff}%</span>
          </span>
          <button onClick={removeCode} className="text-muted hover:text-foreground flex-shrink-0" aria-label="Remove code">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : showCode ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              placeholder="Discount code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode() } }}
              className="uppercase"
            />
            <Button type="button" variant="outline" size="sm" onClick={applyCode} disabled={applying}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>
          {codeError && <p className="text-xs text-red-400">{codeError}</p>}
        </div>
      ) : (
        <button
          onClick={() => setShowCode(true)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mx-auto"
        >
          <Tag className="h-3 w-3" />
          Have a discount code?
        </button>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <p className="text-xs text-center text-muted">Secure payment via Stripe</p>
    </div>
  )
}
