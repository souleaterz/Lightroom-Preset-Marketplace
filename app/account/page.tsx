import React from 'react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { AccountForm } from './AccountForm'

export const metadata = { title: 'Account Settings' }

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/account')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#f0f0f0]">Account Settings</h1>
          <p className="text-[#888891] mt-1">Manage your profile and preferences</p>
        </div>
        <AccountForm profile={profile} />
      </div>
    </div>
  )
}
