'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Delete a preset the signed-in user owns. Presets are referenced by wishlists,
 * reviews and purchases (foreign keys), so we clear the dependent rows first.
 * Presets that have completed sales are NOT deleted — buyers keep their library
 * access; the seller should unpublish those instead.
 */
export async function deletePreset(
  presetId: string
): Promise<{ success?: true; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const admin = createAdminClient()

  const { data: preset } = await admin
    .from('presets')
    .select('id, seller_id')
    .eq('id', presetId)
    .single()
  if (!preset) return { error: 'Preset not found.' }
  if (preset.seller_id !== user.id) return { error: 'You can only delete your own presets.' }

  // Preserve sales history and buyer access.
  const { count: soldCount } = await admin
    .from('purchases')
    .select('id', { count: 'exact', head: true })
    .eq('preset_id', presetId)
    .eq('status', 'succeeded')
  if ((soldCount ?? 0) > 0) {
    return {
      error:
        'This preset has sales, so it can’t be deleted (buyers keep access). Unpublish it to remove it from the store.',
    }
  }

  // Clear dependent rows (admin bypasses RLS), then delete the preset.
  await admin.from('wishlists').delete().eq('preset_id', presetId)
  await admin.from('reviews').delete().eq('preset_id', presetId)
  await admin.from('purchases').delete().eq('preset_id', presetId).neq('status', 'succeeded')

  const { error } = await admin.from('presets').delete().eq('id', presetId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/presets')
  return { success: true }
}
