import React from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Download, ShoppingBag } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Purchase } from '@/types/database'

export const metadata = { title: 'My Library' }

async function getPurchases(): Promise<Purchase[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('purchases')
    .select('*, presets(id, title, before_image_url, after_image_url, file_name, price_cents, profiles!presets_seller_id_fkey(username, display_name))')
    .eq('buyer_id', user.id)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
  return (data as Purchase[]) || []
}

export default async function LibraryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/library')

  const purchases = await getPurchases()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">My Library</h1>
          <p className="text-muted mt-1">{purchases.length} preset{purchases.length !== 1 ? 's' : ''} purchased</p>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No purchases yet</h2>
            <p className="text-muted mb-6">Browse presets and make your first purchase</p>
            <Link href="/browse">
              <Button>Browse Presets</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const preset = purchase.presets
              if (!preset) return null
              return (
                <div key={purchase.id} className="flex items-center gap-5 p-5 bg-surface border border-line rounded-xl hover:border-line-strong transition-colors">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={preset.after_image_url}
                      alt={preset.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/preset/${preset.id}`} className="font-medium text-foreground hover:text-white transition-colors truncate block">
                      {preset.title}
                    </Link>
                    {preset.profiles && (
                      <p className="text-sm text-muted truncate">
                        by {preset.profiles.display_name || preset.profiles.username}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-1">Purchased {formatDate(purchase.created_at)}</p>
                  </div>
                  <div className="flex-shrink-0 text-right space-y-2">
                    <p className="font-mono text-sm text-muted">
                      {purchase.amount_cents ? formatPrice(purchase.amount_cents) : ''}
                    </p>
                    <a href={`/api/download/${purchase.id}`}>
                      <Button size="sm" variant="outline">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
