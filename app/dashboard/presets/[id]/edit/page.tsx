import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { UploadWizard } from '../../new/UploadWizard'
import type { Preset } from '@/types/database'

export const metadata = { title: 'Edit Preset' }

export default async function EditPresetPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: preset } = await supabase
    .from('presets')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', user.id)
    .single()

  if (!preset) notFound()

  const isDraft = !preset.is_published

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            {isDraft ? 'Continue your draft' : 'Edit preset'}
          </h1>
          <p className="text-muted mt-1">
            {isDraft
              ? 'Pick up where you left off — all your steps are saved.'
              : preset.title}
          </p>
        </div>
        <UploadWizard existing={preset as Preset} />
      </div>
    </div>
  )
}
