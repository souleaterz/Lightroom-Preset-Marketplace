import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Download, Star, Package } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { PresetCard } from '@/components/PresetCard'
import { createClient } from '@/lib/supabase/server'
import type { Preset, Profile } from '@/types/database'

interface Props {
  params: { username: string }
}

async function getSeller(username: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  return data as Profile | null
}

async function getSellerPresets(sellerId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url)')
    .eq('seller_id', sellerId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  return (data as Preset[]) || []
}

export async function generateMetadata({ params }: Props) {
  const seller = await getSeller(params.username)
  if (!seller) return { title: 'Seller not found' }
  return { title: `${seller.display_name || seller.username} — Presets` }
}

export default async function SellerPage({ params }: Props) {
  const seller = await getSeller(params.username)
  if (!seller) notFound()

  const presets = await getSellerPresets(seller.id)
  const avgRating =
    presets.length > 0
      ? presets.reduce((sum, p) => sum + p.rating_avg, 0) / presets.filter((p) => p.rating_count > 0).length || 0
      : 0

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      {/* Hero */}
      <div className="border-b border-line py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {seller.avatar_url ? (
              <Image src={seller.avatar_url} alt={seller.display_name || ''} width={80} height={80} className="object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#7c5cfc]">
                {(seller.display_name || seller.username)[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {seller.display_name || seller.username}
            </h1>
            <p className="text-sm text-muted mt-0.5">@{seller.username}</p>
            {seller.bio && (
              <p className="text-muted mt-3 max-w-xl">{seller.bio}</p>
            )}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Package className="h-4 w-4" />
                <span>{presets.length} presets</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Download className="h-4 w-4" />
                <span>{seller.total_sales} sales</span>
              </div>
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{avgRating.toFixed(1)} avg rating</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {presets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted">No presets published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
