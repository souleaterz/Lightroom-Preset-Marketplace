'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isBundle } from '@/lib/utils'
import type { Preset } from '@/types/database'

interface ClaimFreeButtonProps {
  preset: Preset
}

export function ClaimFreeButton({ preset }: ClaimFreeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/claim', {
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
        throw new Error(data.error || 'Failed to claim preset')
      }
      if (data.purchase_id) {
        // Bundles have no single file — just reveal the per-preset download list.
        // Single presets download straight away.
        if (!isBundle(preset)) {
          window.location.href = `/api/download/${data.purchase_id}`
        }
        router.refresh()
      }
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleClaim} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download free
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <p className="text-xs text-center text-muted">Free — no payment required</p>
    </div>
  )
}
