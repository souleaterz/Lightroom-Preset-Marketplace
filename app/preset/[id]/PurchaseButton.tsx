'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { Preset } from '@/types/database'

interface PurchaseButtonProps {
  preset: Preset
}

export function PurchaseButton({ preset }: PurchaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: preset.id }),
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
            Buy now — {formatPrice(preset.price_cents)}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <p className="text-xs text-center text-[#888891]">Secure payment via Stripe</p>
    </div>
  )
}
