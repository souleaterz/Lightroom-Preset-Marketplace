'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateProfile(input: {
  display_name: string
  username: string
  bio: string
}): Promise<{ success?: true; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const username = input.username.toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (username.length < 3) return { error: 'Username must be at least 3 characters.' }
  if (username.length > 30) return { error: 'Username must be 30 characters or fewer.' }

  const admin = createAdminClient()

  // Reject if another user already owns this username.
  const { data: taken } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()
  if (taken) return { error: 'That username is already taken.' }

  // Upsert so it works whether or not a profile row already exists.
  const { error } = await admin.from('profiles').upsert(
    {
      id: user.id,
      username,
      display_name: input.display_name.trim() || null,
      bio: input.bio.trim() || null,
    },
    { onConflict: 'id' }
  )
  if (error) return { error: error.message }
  return { success: true }
}
