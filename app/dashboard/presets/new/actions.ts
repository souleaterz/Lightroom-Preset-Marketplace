'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface UploadTargetRequest {
  key: string
  bucket: string
  ext: string
}

export interface UploadTarget {
  bucket: string
  path: string
  token: string
}

/**
 * Generate signed upload URLs (admin / service role) for each requested file.
 * The browser uploads directly to these, so RLS on storage.objects is never hit
 * and large files don't pass through the serverless function body limit.
 */
export async function createUploadTargets(
  files: UploadTargetRequest[]
): Promise<{ targets?: Record<string, UploadTarget>; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to upload.' }

  const admin = createAdminClient()
  const targets: Record<string, UploadTarget> = {}

  for (const f of files) {
    const safeExt = (f.ext || 'dat').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'dat'
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`
    const { data, error } = await admin.storage.from(f.bucket).createSignedUploadUrl(path)
    if (error || !data) {
      return { error: error?.message || `Could not prepare upload for ${f.bucket}` }
    }
    targets[f.key] = { bucket: f.bucket, path: data.path, token: data.token }
  }

  return { targets }
}

export interface PublishPresetInput {
  title: string
  description: string | null
  category: string
  tags: string[] | null
  price_cents: number
  before_image_url: string
  after_image_url: string
  additional_demo_pairs: { before: string; after: string }[] | null
  file_path: string
  file_name: string
  compatible_with: string[] | null
  whats_included: string | null
  preset_count: number | null
  is_published: boolean
}

/**
 * Insert the preset row using the admin client (bypasses RLS) but with
 * seller_id pinned to the server-verified session user, so it can't be spoofed.
 */
export async function publishPreset(
  input: PublishPresetInput
): Promise<{ id?: string; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to publish.' }

  const admin = createAdminClient()

  // Ensure a profiles row exists to satisfy the seller_id foreign key.
  const fallbackUsername =
    (user.user_metadata?.username as string) ||
    user.email?.split('@')[0] ||
    `user_${user.id.slice(0, 8)}`
  await admin.from('profiles').upsert(
    {
      id: user.id,
      username: String(fallbackUsername).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30),
      display_name:
        (user.user_metadata?.display_name as string) ||
        (user.user_metadata?.full_name as string) ||
        fallbackUsername,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  const { data, error } = await admin
    .from('presets')
    .insert({
      seller_id: user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      tags: input.tags,
      price_cents: input.price_cents,
      before_image_url: input.before_image_url,
      after_image_url: input.after_image_url,
      additional_demo_pairs: input.additional_demo_pairs,
      file_path: input.file_path,
      file_name: input.file_name,
      compatible_with: input.compatible_with,
      whats_included: input.whats_included,
      preset_count: input.preset_count,
      is_published: input.is_published,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Start the new-creator fee-free window on first publish (only sets it once).
  if (input.is_published) {
    const waiverUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await admin
      .from('profiles')
      .update({ fee_waiver_until: waiverUntil })
      .eq('id', user.id)
      .is('fee_waiver_until', null)
  }

  return { id: data.id as string }
}
