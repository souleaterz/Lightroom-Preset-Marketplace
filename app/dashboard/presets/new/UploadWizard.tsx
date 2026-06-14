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
import { createUploadTargets, publishPreset } from './actions'
import { cn } from '@/lib/utils'

const STEPS = ['Basics', 'Demo Images', 'Preset File', 'Review & Publish']
const extOf = (name: string) => name.split('.').pop() || 'dat'
const CATEGORIES = ['portrait', 'landscape', 'street', 'film', 'moody', 'bright']
const COMPAT_OPTIONS = [
  'Lightroom Classic',
  'Lightroom CC (Desktop)',
  'Lightroom Mobile',
  'Photoshop Camera Raw',
]

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
  compatibleWith: string[]
  whatsIncluded: string
  presetCount: string
}

export function UploadWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [loading, setLoading] = useState(false)

  const goToStep = (i: number) => {
    if (i <= maxReached) setStep(i)
  }
  const nextStep = () => {
    setStep((s) => {
      const n = Math.min(STEPS.length - 1, s + 1)
      setMaxReached((m) => Math.max(m, n))
      return n
    })
  }
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [data, setData] = useState<FormData>({
    title: '', description: '', category: 'portrait', tags: [], price: '',
    beforeImage: null, afterImage: null, additionalPairs: [], presetFile: null,
    compatibleWith: ['Lightroom Classic', 'Lightroom CC (Desktop)', 'Lightroom Mobile'],
    whatsIncluded: '', presetCount: '',
  })

  const toggleCompat = (opt: string) =>
    setData((d) => ({
      ...d,
      compatibleWith: d.compatibleWith.includes(opt)
        ? d.compatibleWith.filter((c) => c !== opt)
        : [...d.compatibleWith, opt],
    }))

  const beforePreviewUrl = data.beforeImage ? URL.createObjectURL(data.beforeImage) : null
  const afterPreviewUrl = data.afterImage ? URL.createObjectURL(data.afterImage) : null

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !data.tags.includes(tag) && data.tags.length < 10) {
      setData((d) => ({ ...d, tags: [...d.tags, tag] }))
      setTagInput('')
    }
  }

  const publicUrl = (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

  const handlePublish = async (isDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      if (!data.beforeImage || !data.afterImage) throw new Error('Before/after images required')
      if (!data.presetFile) throw new Error('Preset file required')
      if (!data.title) throw new Error('Title required')
      if (!data.price || isNaN(parseFloat(data.price))) throw new Error('Valid price required')

      // 1. Ask the server for signed upload URLs (service role — no RLS issues).
      const fileList = [
        { key: 'before', bucket: 'preset-demos', ext: extOf(data.beforeImage.name) },
        { key: 'after', bucket: 'preset-demos', ext: extOf(data.afterImage.name) },
        { key: 'preset', bucket: 'preset-files', ext: extOf(data.presetFile.name) },
      ]
      data.additionalPairs.forEach((pair, i) => {
        if (pair.before && pair.after) {
          fileList.push({ key: `add-${i}-before`, bucket: 'preset-demos', ext: extOf(pair.before.name) })
          fileList.push({ key: `add-${i}-after`, bucket: 'preset-demos', ext: extOf(pair.after.name) })
        }
      })

      const prep = await createUploadTargets(fileList)
      if (prep.error || !prep.targets) throw new Error(prep.error || 'Could not prepare upload')
      const targets = prep.targets

      // 2. Upload each file straight to its signed URL.
      const uploadTo = async (key: string, file: File) => {
        const t = targets[key]
        if (!t) throw new Error('Missing upload target')
        const { error } = await supabase.storage
          .from(t.bucket)
          .uploadToSignedUrl(t.path, t.token, file)
        if (error) throw error
        return t
      }

      const beforeT = await uploadTo('before', data.beforeImage)
      const afterT = await uploadTo('after', data.afterImage)

      const additionalPairs: { before: string; after: string }[] = []
      for (let i = 0; i < data.additionalPairs.length; i++) {
        const pair = data.additionalPairs[i]
        if (pair.before && pair.after) {
          const pb = await uploadTo(`add-${i}-before`, pair.before)
          const pa = await uploadTo(`add-${i}-after`, pair.after)
          additionalPairs.push({
            before: publicUrl('preset-demos', pb.path),
            after: publicUrl('preset-demos', pa.path),
          })
        }
      }

      const presetT = await uploadTo('preset', data.presetFile)

      // 3. Insert the preset row server-side (seller_id verified server-side).
      const result = await publishPreset({
        title: data.title,
        description: data.description || null,
        category: data.category,
        tags: data.tags.length > 0 ? data.tags : null,
        price_cents: Math.round(parseFloat(data.price) * 100),
        before_image_url: publicUrl('preset-demos', beforeT.path),
        after_image_url: publicUrl('preset-demos', afterT.path),
        additional_demo_pairs: additionalPairs.length > 0 ? additionalPairs : null,
        file_path: presetT.path,
        file_name: data.presetFile.name,
        compatible_with: data.compatibleWith.length > 0 ? data.compatibleWith : null,
        whats_included: data.whatsIncluded.trim() || null,
        preset_count: data.presetCount ? parseInt(data.presetCount) : null,
        is_published: !isDraft,
      })
      if (result.error) throw new Error(result.error)

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
              <button
                type="button"
                onClick={() => goToStep(i)}
                disabled={i > maxReached}
                className={cn(
                  'flex items-center gap-2 group focus:outline-none',
                  i > maxReached ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
                title={i > maxReached ? `Complete earlier steps first` : `Go to ${s}`}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                  i <= maxReached && 'group-hover:ring-2 group-hover:ring-[#7c5cfc]/40',
                  i < step ? 'bg-[#7c5cfc] text-white' :
                  i === step ? 'bg-[#7c5cfc]/20 border-2 border-[#7c5cfc] text-[#7c5cfc]' :
                  'bg-white/5 text-[#888891]'
                )}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  'text-sm hidden sm:block transition-colors',
                  i === step ? 'text-[#f0f0f0]' :
                  i <= maxReached ? 'text-[#888891] group-hover:text-[#f0f0f0]' : 'text-[#888891]/50'
                )}>{s}</span>
              </button>
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
              <Label className="mb-2">Preset File *</Label>
              <UploadZone
                accept="*"
                maxSize={50 * 1024 * 1024}
                label="Drop your preset file or .zip here"
                hint=".xmp, .lrtemplate, or a .zip with multiple files / a README — up to 50 MB"
                onFile={(f) => setData((d) => ({ ...d, presetFile: f }))}
                file={data.presetFile}
                onClear={() => setData((d) => ({ ...d, presetFile: null }))}
              />
            </div>
            <p className="text-xs text-[#888891]">
              Single preset files (.xmp / .lrtemplate) or a .zip bundle are both supported. Your file is
              stored securely and only accessible to buyers after purchase.
            </p>

            {/* Pack details */}
            <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-5">
              <h3 className="text-sm font-semibold text-[#f0f0f0]">Pack details</h3>

              <div>
                <Label className="mb-2">Compatible with</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPAT_OPTIONS.map((opt) => {
                    const checked = data.compatibleWith.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleCompat(opt)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all',
                          checked
                            ? 'border-[#7c5cfc]/50 bg-[#7c5cfc]/10 text-[#f0f0f0]'
                            : 'border-white/10 text-[#888891] hover:border-white/20'
                        )}
                      >
                        <span className={cn(
                          'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border',
                          checked ? 'bg-[#7c5cfc] border-[#7c5cfc]' : 'border-white/20'
                        )}>
                          {checked && <Check className="h-3 w-3 text-white" />}
                        </span>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5">Number of presets</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={data.presetCount}
                    onChange={(e) => setData((d) => ({ ...d, presetCount: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5">What&apos;s included</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. 12 .xmp presets, a PDF install guide, and a README"
                  value={data.whatsIncluded}
                  onChange={(e) => setData((d) => ({ ...d, whatsIncluded: e.target.value }))}
                />
              </div>
            </div>
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
              {data.presetCount && (
                <div>
                  <p className="text-[#888891] mb-0.5">Presets in pack</p>
                  <p className="text-[#f0f0f0]">{data.presetCount}</p>
                </div>
              )}
              {data.compatibleWith.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[#888891] mb-0.5">Compatible with</p>
                  <p className="text-[#f0f0f0]">{data.compatibleWith.join(', ')}</p>
                </div>
              )}
              {data.whatsIncluded.trim() && (
                <div className="col-span-2">
                  <p className="text-[#888891] mb-0.5">What&apos;s included</p>
                  <p className="text-[#f0f0f0] whitespace-pre-line">{data.whatsIncluded}</p>
                </div>
              )}
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
            <Button onClick={nextStep}>
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
