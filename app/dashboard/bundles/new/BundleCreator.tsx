'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import type { Preset } from '@/types/database'
import { createBundle } from './actions'

const CATEGORIES = ['portrait', 'landscape', 'street', 'film', 'moody', 'bright']

export function BundleCreator({ presets }: { presets: Preset[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('portrait')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const individualTotalCents = useMemo(
    () =>
      presets
        .filter((p) => selected.includes(p.id))
        .reduce((sum, p) => sum + p.price_cents, 0),
    [presets, selected]
  )

  const priceCents = price === '' ? null : Math.round(parseFloat(price) * 100)
  const savingsCents =
    priceCents != null && individualTotalCents > priceCents
      ? individualTotalCents - priceCents
      : 0
  const savingsPct =
    savingsCents > 0 && individualTotalCents > 0
      ? Math.round((savingsCents / individualTotalCents) * 100)
      : 0

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t])
      setTagInput('')
    }
  }

  const submit = async (isDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      if (!title.trim()) throw new Error('Title required')
      if (selected.length < 2) throw new Error('Select at least 2 presets')
      if (price === '' || isNaN(parseFloat(price)) || parseFloat(price) < 0)
        throw new Error('Valid price required (use 0 for free)')

      const result = await createBundle({
        title: title.trim(),
        description: description.trim() || null,
        category,
        tags: tags.length > 0 ? tags : null,
        price_cents: Math.round(parseFloat(price) * 100),
        preset_ids: selected,
        is_published: !isDraft,
      })
      if (result.error) throw new Error(result.error)

      router.push('/dashboard/presets')
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Pick presets */}
      <div className="bg-surface border border-line rounded-2xl p-6">
        <Label className="mb-1.5">Presets in this bundle *</Label>
        <p className="text-xs text-muted mb-4">Select 2 or more of your published presets.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {presets.map((p) => {
            const checked = selected.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  checked
                    ? 'border-[#7c5cfc]/50 bg-[#7c5cfc]/10'
                    : 'border-line hover:border-line-strong'
                )}
              >
                <div className="relative w-14 h-11 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={p.after_image_url} alt={p.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted font-mono">{formatPrice(p.price_cents)}</p>
                </div>
                <span className={cn(
                  'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border',
                  checked ? 'bg-[#7c5cfc] border-[#7c5cfc]' : 'border-line-strong'
                )}>
                  {checked && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Details */}
      <div className="bg-surface border border-line rounded-2xl p-6 space-y-5">
        <div>
          <Label className="mb-1.5">Title *</Label>
          <Input placeholder="e.g. The Complete Moody Collection" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5">Description</Label>
          <Textarea rows={4} placeholder="What's in the pack and who it's for..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5">Category *</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-surface">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1.5">Bundle price (£) *</Label>
            <Input type="number" min="0" step="0.01" placeholder="19.99" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5">Tags (up to 10)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                {t} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Savings summary */}
      {selected.length >= 2 && (
        <div className="bg-surface border border-line rounded-2xl p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">
              {selected.length} presets · individually{' '}
              <span className="font-mono text-foreground">{formatPrice(individualTotalCents)}</span>
            </p>
            {savingsCents > 0 && (
              <p className="text-sm text-green-400 mt-0.5">
                Buyers save {formatPrice(savingsCents)} ({savingsPct}% off)
              </p>
            )}
          </div>
          {priceCents != null && (
            <span className="font-mono text-2xl font-bold text-foreground">{formatPrice(priceCents)}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {error && <p className="text-sm text-red-400 self-center mr-auto">{error}</p>}
        <Button variant="outline" onClick={() => submit(true)} disabled={loading}>
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button onClick={() => submit(false)} disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Bundle'}
        </Button>
      </div>
    </div>
  )
}
