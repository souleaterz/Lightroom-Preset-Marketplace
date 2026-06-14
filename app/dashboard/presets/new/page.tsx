import React from 'react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { UploadWizard } from './UploadWizard'

export const metadata = { title: 'Upload New Preset' }

export default async function NewPresetPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard/presets/new')

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#f0f0f0]">Upload New Preset</h1>
          <p className="text-[#888891] mt-1">Complete all steps to publish your preset</p>
        </div>
        <UploadWizard />
      </div>
    </div>
  )
}
