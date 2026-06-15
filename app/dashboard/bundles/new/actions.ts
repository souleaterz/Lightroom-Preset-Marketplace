'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Preset } from '@/types/database'

export interface CreateBundleInput {
  title: string
  description: string | null
  category: string
  tags: string[] | null
  price_cents: number
  preset_ids: string[]
  is_published: boolean
}

/**
 * Create a bundle: a presets row that groups other presets the seller owns.
 * Demo images and compatibility are derived from the included presets so the
 * existing preset detail page / browse grid render it with no special casing.
 */
export async function createBundle(
  input: CreateBundleInput
): Promise<{ id?: string; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  if (!input.title.trim()) return { error: 'Title required.' }
  if (input.price_cents < 0) return { error: 'Valid price required.' }
  if (!input.preset_ids || input.preset_ids.length < 2) {
    return { error: 'A bundle needs at least 2 presets.' }
  }

  const admin = createAdminClient()

  // Pull the chosen presets and verify they all belong to this seller, are
  // published, and aren't themselves bundles. Prevents spoofing other people's
  // presets into a bundle.
  const { data: rows } = await admin
    .from('presets')
    .select('id, before_image_url, after_image_url, compatible_with, bundle_preset_ids')
    .in('id', input.preset_ids)
    .eq('seller_id', user.id)

  const included = (rows as Pick<Preset, 'id' | 'before_image_url' | 'after_image_url' | 'compatible_with' | 'bundle_preset_ids'>[]) || []
  const validIds = included.filter((p) => !p.bundle_preset_ids || p.bundle_preset_ids.length === 0)
  if (validIds.length !== input.preset_ids.length) {
    return { error: 'Some selected presets are invalid (not yours, or already a bundle).' }
  }

  // Cover from the first selected; remaining presets become demo gallery slides.
  const first = included.find((p) => p.id === input.preset_ids[0]) || included[0]
  const rest = input.preset_ids
    .slice(1)
    .map((id) => included.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
  const additionalPairs = rest.map((p) => ({ before: p.before_image_url, after: p.after_image_url }))

  // Union of every included preset's compatibility list.
  const compatibleWith = Array.from(
    new Set(included.flatMap((p) => p.compatible_with || []))
  )

  const { data, error } = await admin
    .from('presets')
    .insert({
      seller_id: user.id,
      title: input.title.trim(),
      description: input.description,
      category: input.category,
      tags: input.tags,
      price_cents: input.price_cents,
      before_image_url: first.before_image_url,
      after_image_url: first.after_image_url,
      additional_demo_pairs: additionalPairs.length > 0 ? additionalPairs : null,
      bundle_preset_ids: input.preset_ids,
      file_path: null,
      file_name: null,
      compatible_with: compatibleWith.length > 0 ? compatibleWith : null,
      preset_count: input.preset_ids.length,
      is_published: input.is_published,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data.id as string }
}
