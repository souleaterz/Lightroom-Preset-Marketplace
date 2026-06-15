import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { PresetCard } from '@/components/PresetCard'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Preset } from '@/types/database'

export const metadata = { title: 'Wishlist' }

export default async function WishlistPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/wishlist')

  const { data } = await supabase
    .from('wishlists')
    .select('*, presets(*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url, is_verified, total_sales))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const presets: Preset[] = (data || []).map((w: { presets: Preset }) => w.presets).filter(Boolean)

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Wishlist</h1>
          <p className="text-muted mt-1">{presets.length} saved preset{presets.length !== 1 ? 's' : ''}</p>
        </div>

        {presets.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted mb-6">Save presets you love for later</p>
            <Link href="/browse">
              <Button>Browse Presets</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
