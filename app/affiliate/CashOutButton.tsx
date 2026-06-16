'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface CashOutButtonProps {
  isConnected: boolean
  availableCents: number
  canWithdraw: boolean
  minCents: number
}

export function CashOutButton({ isConnected, availableCents, canWithdraw, minCents }: CashOutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  if (!isConnected) {
    return (
      <div>
        <a href="/api/stripe/connect/onboard?next=/affiliate">
          <Button>
            <Wallet className="h-4 w-4" />
            Connect Stripe to get paid
          </Button>
        </a>
        <p className="text-xs text-muted mt-2">Connect a Stripe account to receive your payouts.</p>
      </div>
    )
  }

  const cashOut = async () => {
    setLoading(true)
    setError(null)
    setDone(null)
    try {
      const res = await fetch('/api/affiliate/payout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payout failed')
      setDone(`${formatPrice(data.paid_cents)} is on its way to your account.`)
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={cashOut} disabled={loading || !canWithdraw}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Cash out {formatPrice(availableCents)}
          </>
        )}
      </Button>
      {!canWithdraw && !done && (
        <p className="text-xs text-muted mt-2">
          Minimum cash-out is {formatPrice(minCents)}. Keep referring to reach it.
        </p>
      )}
      {done && <p className="text-xs text-green-400 mt-2">{done}</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
