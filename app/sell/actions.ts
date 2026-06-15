'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { attributeReferral } from '@/lib/affiliate'

/**
 * Opt the current member into selling. Flips is_seller on their profile and
 * sends them to the dashboard. Members are buyers until they call this.
 */
export async function becomeSeller(): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_seller: true })
    .eq('id', user.id)
  if (error) return { error: error.message }

  // Credit the affiliate who referred this creator, if any.
  await attributeReferral(user.id, cookies().get('ps_ref')?.value)

  redirect('/dashboard')
}
