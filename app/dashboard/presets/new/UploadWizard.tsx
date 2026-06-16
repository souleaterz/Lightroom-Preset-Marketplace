'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { UploadZone } from '@/components/UploadZone'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { createUploadTargets, publishPreset, updatePreset } from './actions'
import { cn } from '@/lib/utils'
import { CURATED_CATEGORIES, categoryLabel, normalizeCategory } from '@/lib/categories'
import type { Preset } from '@/types/database'

const STEPS = ['Basics', 'Demo Images', 'Preset File', 'Review & Publish']
const extOf = (name: string) => name.split('.').pop() || 'dat'
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

export function UploadWizard({ existing }: { existing?: Preset }) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!existing

  const [step, setStep] = useState(0)
  // In edit mode every step is already reachable.
  const [maxReached, setMaxReached] = useState(isEdit ? STEPS.length - 1 : 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  // Files already stored for this preset (edit mode) — kept unless replaced.
  const existingBefore = existing?.before_image_url ?? null
  const existingAfter = existing?.after_image_url ?? null
  const existingFile = existing ? { name: existing.file_name, path: existing.file_path } : null
  const existingAdditional = existing?.additional_demo_pairs ?? []

  const [data, setData] = useState<FormData>({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    category: existing?.category ? categoryLabel(existing.category) : 'Portrait',
    tags: existing?.tags ?? [],
    price: existing ? (existing.price_cents / 100).toString() : '',
    beforeImage: null,
    afterImage: null,
    additionalPairs: [],
    presetFile: null,
    compatibleWith: existing?.compatible_with ?? ['Lightroom Classic', 'Lightroom CC (Desktop)', 'Lightroom Mobile'],
    whatsIncluded: existing?.whats_included ?? '',
    presetCount: existing?.preset_count ? String(existing.preset_count) : '',
  })

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

  // Effective preview URLs (newly picked file wins, else the stored image).
  const beforePreviewUrl = data.beforeImage ? URL.createObjectURL(data.beforeImage) : existingBefore
  const afterPreviewUrl = data.afterImage ? URL.createObjectURL(data.afterImage) : existingAfter

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !data.tags.includes(tag) && data.tags.length < 10) {
      setData((d) => ({ ...d, tags: [...d.tags, tag] }))
      setTagInput('')
    }
  }

  const toggleCompat = (opt: string) =>
    setData((d) => ({
      ...d,
      compatibleWith: d.compatibleWith.includes(opt)
        ? d.compatibleWith.filter((c) => c !== opt)
        : [...d.compatibleWith, opt],
    }))

  const publicUrl = (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

  const handlePublish = async (isDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const hasBefore = data.beforeImage || existingBefore
      const hasAfter = data.afterImage || existingAfter
      const hasFile = data.presetFile || existingFile
      if (!hasBefore || !hasAfter) throw new Error('Before/after images required')
      if (!hasFile) throw new Error('Preset file required')
      if (!data.title) throw new Error('Title required')
      if (!normalizeCategory(data.category)) throw new Error('Category required')
      if (data.price === '' || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0)
        throw new Error('Valid price required (use 0 for free)')

      // 1. Only upload files that were newly selected.
      const fileList: { key: string; bucket: string; ext: string }[] = []
      if (data.beforeImage) fileList.push({ key: 'before', bucket: 'preset-demos', ext: extOf(data.beforeImage.name) })
      if (data.afterImage) fileList.push({ key: 'after', bucket: 'preset-demos', ext: extOf(data.afterImage.name) })
      if (data.presetFile) fileList.push({ key: 'preset', bucket: 'preset-files', ext: extOf(data.presetFile.name) })
      data.additionalPairs.forEach((pair, i) => {
        if (pair.before && pair.after) {
          fileList.push({ key: `add-${i}-before`, bucket: 'preset-demos', ext: extOf(pair.before.name) })
          fileList.push({ key: `add-${i}-after`, bucket: 'preset-demos', ext: extOf(pair.after.name) })
        }
      })

      const targets: Record<string, { bucket: string; path: string; token: string }> = {}
      if (fileList.length > 0) {
        const prep = await createUploadTargets(fileList)
        if (prep.error || !prep.targets) throw new Error(prep.error || 'Could not prepare upload')
        Object.assign(targets, prep.targets)
      }

      const uploadTo = async (key: string, file: File) => {
        const t = targets[key]
        if (!t) throw new Error('Missing upload target')
        const { error: upErr } = await supabase.storage.from(t.bucket).uploadToSignedUrl(t.path, t.token, file)
        if (upErr) throw upErr
        return t
      }

      // 2. Resolve final URLs/paths (new upload or kept existing).
      const beforeUrl = data.beforeImage
        ? publicUrl('preset-demos', (await uploadTo('before', data.beforeImage)).path)
        : existingBefore!
      const afterUrl = data.afterImage
        ? publicUrl('preset-demos', (await uploadTo('after', data.afterImage)).path)
        : existingAfter!

      const newPairs: { before: string; after: string }[] = []
      for (let i = 0; i < data.additionalPairs.length; i++) {
        const pair = data.additionalPairs[i]
        if (pair.before && pair.after) {
          const pb = await uploadTo(`add-${i}-before`, pair.before)
          const pa = await uploadTo(`add-${i}-after`, pair.after)
          newPairs.push({ before: publicUrl('preset-demos', pb.path), after: publicUrl('preset-demos', pa.path) })
        }
      }
      const additionalPairs = [...existingAdditional, ...newPairs]

      const filePath = data.presetFile
        ? (await uploadTo('preset', data.presetFile)).path
        : existingFile!.path
      const fileName = data.presetFile ? data.presetFile.name : existingFile!.name

      // 3. Save (update existing draft/preset, or insert a new one).
      const payload = {
        title: data.title,
        description: data.description || null,
        category: data.category,
        tags: data.tags.length > 0 ? data.tags : null,
        price_cents: Math.round(parseFloat(data.price) * 100),
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        additional_demo_pairs: additionalPairs.length > 0 ? additionalPairs : null,
        file_path: filePath,
        file_name: fileName,
        compatible_with: data.compatibleWith.length > 0 ? data.compatibleWith : null,
        whats_included: data.whatsIncluded.trim() || null,
        preset_count: data.presetCount ? parseInt(data.presetCount) : null,
        is_published: !isDraft,
      }

      const result = existing
        ? await updatePreset({ id: existing.id, ...payload })
        : await publishPreset(payload)
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
                  'bg-overlay text-muted'
                )}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  'text-sm hidden sm:block transition-colors',
                  i === step ? 'text-foreground' :
                  i <= maxReached ? 'text-muted group-hover:text-foreground' : 'text-muted/50'
                )}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-3', i < step ? 'bg-[#7c5cfc]' : 'bg-overlay-strong')} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-surface border border-line rounded-2xl p-8">
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
                <Input
                  list="preset-categories"
                  placeholder="Pick a suggestion or type your own"
                  value={data.category}
                  onChange={(e) => setData((d) => ({ ...d, category: e.target.value }))}
                />
                <datalist id="preset-categories">
                  {CURATED_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.label} />
                  ))}
                </datalist>
                <p className="text-xs text-muted mt-1.5">Choose a suggestion or add a new category.</p>
              </div>
              <div>
                <Label className="mb-1.5">Price (£) *</Label>
                <Input type="number" min="0" step="0.01" placeholder="9.99" value={data.price} onChange={(e) => setData((d) => ({ ...d, price: e.target.value }))} />
                <p className="text-xs text-muted mt-1.5">Enter 0 to offer it free — a great way to grow your audience.</p>
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
                  label={existingBefore ? 'Replace before photo' : 'Drop before photo'}
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
                  label={existingAfter ? 'Replace after photo' : 'Drop after photo'}
                  hint="JPEG or WebP, max 10 MB"
                  onFile={(f) => setData((d) => ({ ...d, afterImage: f }))}
                  file={data.afterImage}
                  onClear={() => setData((d) => ({ ...d, afterImage: null }))}
                />
              </div>
            </div>

            {beforePreviewUrl && afterPreviewUrl && (
              <div>
                <Label className="mb-2">{isEdit && !data.beforeImage && !data.afterImage ? 'Current preview' : 'Preview'}</Label>
                <BeforeAfterSlider beforeSrc={beforePreviewUrl} afterSrc={afterPreviewUrl} />
              </div>
            )}

            {data.additionalPairs.length + existingAdditional.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setData((d) => ({ ...d, additionalPairs: [...d.additionalPairs, { before: null, after: null }] }))}
              >
                + Add another demo pair
              </Button>
            )}
            {existingAdditional.length > 0 && (
              <p className="text-xs text-muted">{existingAdditional.length} existing demo pair{existingAdditional.length === 1 ? '' : 's'} will be kept.</p>
            )}
          </div>
        )}

        {/* Step 3: Preset file */}
        {step === 2 && (
          <div className="space-y-4">
            {existingFile && !data.presetFile && (
              <div className="flex items-center gap-2 text-sm text-foreground bg-overlay border border-line rounded-lg px-4 py-3">
                <Check className="h-4 w-4 text-[#7c5cfc]" />
                Current file: <span className="font-mono text-muted">{existingFile.name}</span>
              </div>
            )}
            <div>
              <Label className="mb-2">{existingFile ? 'Replace preset file (optional)' : 'Preset File *'}</Label>
              <UploadZone
                accept="*"
                maxSize={50 * 1024 * 1024}
                label="Drop your preset file or .zip here"
                hint=".xmp, .lrtemplate, .dng (Lightroom Mobile), or a .zip with multiple files / a README — up to 50 MB"
                onFile={(f) => setData((d) => ({ ...d, presetFile: f }))}
                file={data.presetFile}
                onClear={() => setData((d) => ({ ...d, presetFile: null }))}
              />
            </div>

            {/* Pack details */}
            <div className="pt-4 mt-2 border-t border-line space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Pack details</h3>

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
                            ? 'border-[#7c5cfc]/50 bg-[#7c5cfc]/10 text-foreground'
                            : 'border-line text-muted hover:border-line-strong'
                        )}
                      >
                        <span className={cn(
                          'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border',
                          checked ? 'bg-[#7c5cfc] border-[#7c5cfc]' : 'border-line-strong'
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
            <h3 className="font-semibold text-foreground">Review your preset</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-0.5">Title</p>
                <p className="text-foreground">{data.title || '—'}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">Price</p>
                <p className="text-foreground font-mono">
                  {data.price === '' ? '—' : parseFloat(data.price) === 0 ? 'Free' : `£${data.price}`}
                </p>
              </div>
              <div>
                <p className="text-muted mb-0.5">Category</p>
                <p className="text-foreground capitalize">{data.category}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">File</p>
                <p className="text-foreground font-mono text-xs">{data.presetFile?.name || existingFile?.name || '—'}</p>
              </div>
              {data.presetCount && (
                <div>
                  <p className="text-muted mb-0.5">Presets in pack</p>
                  <p className="text-foreground">{data.presetCount}</p>
                </div>
              )}
              {data.compatibleWith.length > 0 && (
                <div className="col-span-2">
                  <p className="text-muted mb-0.5">Compatible with</p>
                  <p className="text-foreground">{data.compatibleWith.join(', ')}</p>
                </div>
              )}
              {data.whatsIncluded.trim() && (
                <div className="col-span-2">
                  <p className="text-muted mb-0.5">What&apos;s included</p>
                  <p className="text-foreground whitespace-pre-line">{data.whatsIncluded}</p>
                </div>
              )}
            </div>
            {beforePreviewUrl && afterPreviewUrl && (
              <div>
                <p className="text-muted text-sm mb-2">Demo preview</p>
                <BeforeAfterSlider beforeSrc={beforePreviewUrl} afterSrc={afterPreviewUrl} />
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
                {loading ? 'Publishing...' : isEdit && existing?.is_published ? 'Update' : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
