import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSellerProfile } from '@/lib/utils'

/**
 * Gate every /dashboard/* route behind seller status. Buyers are sent to the
 * opt-in page; signed-out visitors to sign-in.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_seller, stripe_account_id')
    .eq('id', user.id)
    .single()

  if (!isSellerProfile(profile)) redirect('/sell')

  return <>{children}</>
}
