'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeCode } from '@/lib/discounts'

export interface CreateCodeInput {
  code: string
  percent_off: number
  max_uses: number | null
  expires_at: string | null
}

export async function createCode(input: CreateCodeInput): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const code = normalizeCode(input.code)
  if (!code || code.length < 3) return { error: 'Code must be at least 3 characters.' }
  if (!/^[A-Z0-9_-]+$/.test(code)) return { error: 'Use only letters, numbers, - and _.' }
  if (input.percent_off < 1 || input.percent_off > 100) return { error: 'Percent off must be 1–100.' }
  if (input.max_uses != null && input.max_uses < 1) return { error: 'Max uses must be at least 1.' }

  // RLS restricts writes to the seller's own rows; seller_id is pinned here.
  const { error } = await supabase.from('discount_codes').insert({
    seller_id: user.id,
    code,
    percent_off: input.percent_off,
    max_uses: input.max_uses,
    expires_at: input.expires_at,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You already have a code with that name.' }
    return { error: error.message }
  }
  return {}
}

export async function toggleCode(id: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('discount_codes')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('seller_id', user.id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteCode(id: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('discount_codes')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)
  if (error) return { error: error.message }
  return {}
}
