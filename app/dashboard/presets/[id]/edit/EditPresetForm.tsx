'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Preset } from '@/types/database'

const CATEGORIES = ['portrait', 'landscape', 'street', 'film', 'moody', 'bright']

export function EditPresetForm({ preset }: { preset: Preset }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    title: preset.title,
    description: preset.description || '',
    category: preset.category || 'portrait',
    price: (preset.price_cents / 100).toString(),
    tags: preset.tags || [],
  })

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
      setTagInput('')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('presets')
      .update({
        title: form.title,
        description: form.description || null,
        category: form.category,
        price_cents: Math.round(parseFloat(form.price) * 100),
        tags: form.tags.length > 0 ? form.tags : null,
      })
      .eq('id', preset.id)

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard/presets')
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <div>
          <Label htmlFor="title" className="mb-1.5">Title *</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div>
          <Label htmlFor="desc" className="mb-1.5">Description</Label>
          <Textarea id="desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={5} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5">Category</Label>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111114]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="price" className="mb-1.5">Price (£)</Label>
            <Input id="price" type="number" min="0.99" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
        </div>
        <div>
          <Label className="mb-1.5">Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="Add tag" />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </form>
  )
}
