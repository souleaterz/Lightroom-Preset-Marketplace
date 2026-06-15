import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import type { Preset } from '@/types/database'
import { BundleCreator } from './BundleCreator'

export const metadata = { title: 'Create a Bundle' }

export default async function NewBundlePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard/bundles/new')

  // Only the seller's own, published, non-bundle presets can go into a bundle.
  const { data } = await supabase
    .from('presets')
    .select('id, title, price_cents, before_image_url, after_image_url, category, bundle_preset_ids')
    .eq('seller_id', user.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const presets = ((data as Preset[]) || []).filter(
    (p) => !p.bundle_preset_ids || p.bundle_preset_ids.length === 0
  )

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Create a Bundle</h1>
          <p className="text-muted mt-1">
            Group your presets into a discounted pack to raise your average order value.
          </p>
        </div>

        {presets.length < 2 ? (
          <div className="bg-surface border border-line rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              You need at least 2 published presets
            </h2>
            <p className="text-muted mb-6">
              Publish a couple of presets first, then come back to bundle them together.
            </p>
            <Link href="/dashboard/presets/new" className="text-[#7c5cfc] hover:underline">
              Upload a preset →
            </Link>
          </div>
        ) : (
          <BundleCreator presets={presets} />
        )}
      </div>
    </div>
  )
}
