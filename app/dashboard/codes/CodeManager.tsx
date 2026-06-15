'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { DiscountCode } from '@/types/database'
import { createCode, toggleCode, deleteCode } from './actions'

export function CodeManager({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [percentOff, setPercentOff] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      const pct = parseInt(percentOff)
      if (!code.trim()) throw new Error('Enter a code')
      if (isNaN(pct) || pct < 1 || pct > 100) throw new Error('Percent off must be 1–100')

      const res = await createCode({
        code: code.trim(),
        percent_off: pct,
        max_uses: maxUses.trim() ? parseInt(maxUses) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      if (res.error) throw new Error(res.error)

      setCode(''); setPercentOff(''); setMaxUses(''); setExpiresAt('')
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onToggle = async (c: DiscountCode) => {
    setBusyId(c.id)
    await toggleCode(c.id, !c.is_active)
    router.refresh()
    setBusyId(null)
  }

  const onDelete = async (id: string) => {
    setBusyId(id)
    await deleteCode(id)
    router.refresh()
    setBusyId(null)
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="bg-surface border border-line rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Create a code</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5">Code *</Label>
            <Input
              placeholder="SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="uppercase font-mono"
            />
          </div>
          <div>
            <Label className="mb-1.5">Percent off *</Label>
            <Input type="number" min="1" max="100" placeholder="20" value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5">Max uses</Label>
            <Input type="number" min="1" placeholder="Unlimited" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5">Expires</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={create} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Create code</>}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <p className="text-xs text-muted">A code applies to all of your presets. Codes are case-insensitive.</p>
      </div>

      {/* Existing codes */}
      {initialCodes.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">No discount codes yet.</p>
      ) : (
        <div className="space-y-3">
          {initialCodes.map((c) => {
            const expired = c.expires_at && new Date(c.expires_at).getTime() <= Date.now()
            const maxedOut = c.max_uses != null && c.times_used >= c.max_uses
            const live = c.is_active && !expired && !maxedOut
            return (
              <div key={c.id} className="flex items-center gap-3 p-4 bg-surface border border-line rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-semibold text-foreground">{c.code}</span>
                    <Badge variant="secondary">{c.percent_off}% off</Badge>
                    <Badge variant={live ? 'default' : 'secondary'}>
                      {!c.is_active ? 'Disabled' : expired ? 'Expired' : maxedOut ? 'Used up' : 'Active'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span>{c.times_used} used{c.max_uses != null ? ` / ${c.max_uses}` : ''}</span>
                    {c.expires_at && <span>Expires {formatDate(c.expires_at)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onToggle(c)}
                  disabled={busyId === c.id}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border transition-colors',
                    c.is_active
                      ? 'border-line text-muted hover:text-foreground'
                      : 'border-[#7c5cfc]/40 text-[#7c5cfc]'
                  )}
                >
                  {c.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  disabled={busyId === c.id}
                  className="p-2 rounded-lg text-muted hover:text-red-400 transition-colors"
                  aria-label="Delete code"
                >
                  {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
