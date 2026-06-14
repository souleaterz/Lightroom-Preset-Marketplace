import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { EditPresetForm } from './EditPresetForm'

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

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#f0f0f0]">Edit Preset</h1>
          <p className="text-[#888891] mt-1">{preset.title}</p>
        </div>
        <EditPresetForm preset={preset} />
      </div>
    </div>
  )
}
