import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Preset } from '@/types/database'
import { PresetActions } from './PresetActions'

export const metadata = { title: 'Manage Presets' }

export default async function ManagePresetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard/presets')

  const { data } = await supabase
    .from('presets')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const presets = (data as Preset[]) || []

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">My Presets</h1>
            <p className="text-muted mt-1">{presets.length} preset{presets.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/dashboard/presets/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Preset
            </Button>
          </Link>
        </div>

        {presets.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-foreground mb-2">No presets yet</h2>
            <p className="text-muted mb-6">Upload your first preset and start selling</p>
            <Link href="/dashboard/presets/new">
              <Button>Upload Preset</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {presets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-surface border border-line rounded-xl hover:border-line-strong transition-colors">
                <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={preset.after_image_url}
                    alt={preset.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/preset/${preset.id}`} className="font-medium text-foreground hover:text-white transition-colors truncate">
                      {preset.title}
                    </Link>
                    <Badge variant={preset.is_published ? 'default' : 'secondary'}>
                      {preset.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span className="font-mono">{formatPrice(preset.price_cents)}</span>
                    <span>{preset.downloads} downloads</span>
                    <span>{preset.rating_count > 0 ? `${preset.rating_avg.toFixed(1)}★` : 'No reviews'}</span>
                    <span className="hidden sm:inline">{formatDate(preset.created_at)}</span>
                  </div>
                </div>
                <PresetActions preset={preset} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
