'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { UploadZone } from '@/components/UploadZone'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const STEPS = ['Basics', 'Demo Images', 'Preset File', 'Review & Publish']
const CATEGORIES = ['portrait', 'landscape', 'street', 'film', 'moody', 'bright']

interface FormData {
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  beforeImage: File | null
  afterImage: File | null
  additionalPairs: { before: File | null; after: File | null }[]
  presetFile: File | null
}

interface UploadWizardProps {
  sellerId: string
}

export function UploadWizard({ sellerId }: UploadWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [data, setData] = useState<FormData>({
    title: '', description: '', category: 'portrait', tags: [], price: '',
    beforeImage: null, afterImage: null, additionalPairs: [], presetFile: null,
  })

  const beforePreviewUrl = data.beforeImage ? URL.createObjectURL(data.beforeImage) : null
  const afterPreviewUrl = data.afterImage ? URL.createObjectURL(data.afterImage) : null

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !data.tags.includes(tag) && data.tags.length < 10) {
      setData((d) => ({ ...d, tags: [...d.tags, tag] }))
      setTagInput('')
    }
  }

  const uploadImage = async (file: File, bucket: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const path = `${sellerId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  const handlePublish = async (isDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      if (!data.beforeImage || !data.afterImage) throw new Error('Before/after images required')
      if (!data.presetFile) throw new Error('Preset file required')
      if (!data.title) throw new Error('Title required')
      if (!data.price || isNaN(parseFloat(data.price))) throw new Error('Valid price required')

      const [beforeUrl, afterUrl] = await Promise.all([
        uploadImage(data.beforeImage, 'preset-demos'),
        uploadImage(data.afterImage, 'preset-demos'),
      ])

      const additionalPairs: { before: string; after: string }[] = []
      for (const pair of data.additionalPairs) {
        if (pair.before && pair.after) {
          const [b, a] = await Promise.all([
            uploadImage(pair.before, 'preset-demos'),
            uploadImage(pair.after, 'preset-demos'),
          ])
          additionalPairs.push({ before: b, after: a })
        }
      }

      const fileExt = data.presetFile.name.split('.').pop()
      const filePath = `${sellerId}/${Date.now()}.${fileExt}`
      const { error: fileErr } = await supabase.storage.from('preset-files').upload(filePath, data.presetFile)
      if (fileErr) throw fileErr

      const { error: dbErr } = await supabase.from('presets').insert({
        seller_id: sellerId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        tags: data.tags.length > 0 ? data.tags : null,
        price_cents: Math.round(parseFloat(data.price) * 100),
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        additional_demo_pairs: additionalPairs.length > 0 ? additionalPairs : null,
        file_path: filePath,
        file_name: data.presetFile.name,
        is_published: !isDraft,
      })

      if (dbErr) throw dbErr

      router.push('/dashboard/presets')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                  i < step ? 'bg-[#7c5cfc] text-white' :
                  i === step ? 'bg-[#7c5cfc]/20 border-2 border-[#7c5cfc] text-[#7c5cfc]' :
                  'bg-white/5 text-[#888891]'
                )}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  'text-sm hidden sm:block',
                  i === step ? 'text-[#f0f0f0]' : 'text-[#888891]'
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-3', i < step ? 'bg-[#7c5cfc]' : 'bg-white/10')} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8">
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5">Title *</Label>
              <Input placeholder="e.g. Moody Golden Hour" value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5">Description</Label>
              <Textarea placeholder="Describe your preset, what makes it unique, ideal scenarios..." rows={5} value={data.description} onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5">Category *</Label>
                <Select value={data.category} onChange={(e) => setData((d) => ({ ...d, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111114]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Price (£) *</Label>
                <Input type="number" min="0.99" step="0.01" placeholder="9.99" value={data.price} onChange={(e) => setData((d) => ({ ...d, price: e.target.value }))} />
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
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setData((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }))}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Demo images */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">Before Image *</Label>
                <UploadZone
                  accept=".jpg,.jpeg,.webp,.png"
                  maxSize={10 * 1024 * 1024}
                  label="Drop before photo"
                  hint="JPEG or WebP, max 10 MB"
                  onFile={(f) => setData((d) => ({ ...d, beforeImage: f }))}
                  file={data.beforeImage}
                  onClear={() => setData((d) => ({ ...d, beforeImage: null }))}
                />
              </div>
              <div>
                <Label className="mb-2">After Image *</Label>
                <UploadZone
                  accept=".jpg,.jpeg,.webp,.png"
                  maxSize={10 * 1024 * 1024}
                  label="Drop after photo"
                  hint="JPEG or WebP, max 10 MB"
                  onFile={(f) => setData((d) => ({ ...d, afterImage: f }))}
                  file={data.afterImage}
                  onClear={() => setData((d) => ({ ...d, afterImage: null }))}
                />
              </div>
            </div>

            {beforePreviewUrl && afterPreviewUrl && (
              <div>
                <Label className="mb-2">Preview</Label>
                <BeforeAfterSlider beforeSrc={beforePreviewUrl} afterSrc={afterPreviewUrl} />
              </div>
            )}

            {data.additionalPairs.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setData((d) => ({ ...d, additionalPairs: [...d.additionalPairs, { before: null, after: null }] }))}
              >
                + Add another demo pair
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Preset file */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Preset File (.xmp or .lrtemplate) *</Label>
              <UploadZone
                accept=".xmp,.lrtemplate"
                maxSize={50 * 1024 * 1024}
                label="Drop your preset file here"
                hint=".xmp or .lrtemplate, up to 50 MB"
                onFile={(f) => setData((d) => ({ ...d, presetFile: f }))}
                file={data.presetFile}
                onClear={() => setData((d) => ({ ...d, presetFile: null }))}
              />
            </div>
            <p className="text-xs text-[#888891]">
              Your preset file is stored securely and only accessible to buyers after purchase.
            </p>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#f0f0f0]">Review your preset</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#888891] mb-0.5">Title</p>
                <p className="text-[#f0f0f0]">{data.title || '—'}</p>
              </div>
              <div>
                <p className="text-[#888891] mb-0.5">Price</p>
                <p className="text-[#f0f0f0] font-mono">£{data.price || '—'}</p>
              </div>
              <div>
                <p className="text-[#888891] mb-0.5">Category</p>
                <p className="text-[#f0f0f0] capitalize">{data.category}</p>
              </div>
              <div>
                <p className="text-[#888891] mb-0.5">File</p>
                <p className="text-[#f0f0f0] font-mono text-xs">{data.presetFile?.name || '—'}</p>
              </div>
            </div>
            {data.beforeImage && data.afterImage && (
              <div>
                <p className="text-[#888891] text-sm mb-2">Demo preview</p>
                <BeforeAfterSlider
                  beforeSrc={URL.createObjectURL(data.beforeImage)}
                  afterSrc={URL.createObjectURL(data.afterImage)}
                />
              </div>
            )}
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>

        <div className="flex gap-3">
          {error && <p className="text-sm text-red-400 self-center">{error}</p>}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handlePublish(true)} disabled={loading}>
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button onClick={() => handlePublish(false)} disabled={loading}>
                {loading ? 'Publishing...' : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
