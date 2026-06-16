import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { QuickPreviewClient } from '@/app/browse/QuickPreviewClient'
import { createClient } from '@/lib/supabase/server'
import { isDemoPreset } from '@/lib/utils'
import { siteConfig } from '@/lib/site'
import type { Preset } from '@/types/database'

export const dynamic = 'force-dynamic'

const description =
  'Download free Lightroom presets with live before/after previews. Hand-crafted free presets for portraits, film, moody, landscape and more — for Lightroom desktop and mobile (XMP & DNG).'

export const metadata: Metadata = {
  title: 'Free Lightroom Presets',
  description,
  alternates: { canonical: '/free-lightroom-presets' },
  openGraph: {
    type: 'website',
    title: `Free Lightroom Presets | ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/free-lightroom-presets`,
  },
}

async function getFreePresets(): Promise<Preset[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url, is_verified, total_sales)')
    .eq('is_published', true)
    .eq('price_cents', 0)
    .order('created_at', { ascending: false })
    .limit(60)
  return ((data as Preset[]) || []).filter((p) => !isDemoPreset(p))
}

export default async function FreePresetsPage() {
  const presets = await getFreePresets()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold text-foreground mb-3">Free Lightroom Presets</h1>
          <p className="text-muted leading-relaxed">
            Grab free Lightroom presets from independent creators — no catch. Preview the exact look on
            real photos with the before/after slider, then download in one click. Works with Lightroom
            Classic, CC and the free mobile app (XMP &amp; DNG). Sign in to download; they&apos;re yours forever.
          </p>
        </header>

        {presets.length > 0 ? (
          <QuickPreviewClient presets={presets} />
        ) : (
          <div className="text-center py-16 bg-surface border border-line rounded-2xl">
            <p className="text-foreground font-medium mb-2">No free presets right now</p>
            <p className="text-muted mb-6">Check back soon, or explore the full marketplace.</p>
            <Link href="/browse" className="text-[#7c5cfc] hover:underline">Browse all presets →</Link>
          </div>
        )}

        <div className="mt-14 border-t border-line pt-8 text-sm text-muted">
          Looking for more? <Link href="/browse" className="text-[#7c5cfc] hover:underline">Browse the full marketplace</Link>{' '}
          or learn <Link href="/blog/how-to-install-lightroom-presets" className="text-[#7c5cfc] hover:underline">how to install Lightroom presets</Link>.
        </div>
      </div>
    </div>
  )
}
