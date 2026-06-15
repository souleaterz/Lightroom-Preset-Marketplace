import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Download, FileCode2, Monitor, Layers, Package } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { PresetCard } from '@/components/PresetCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/StarRating'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, isDemoPreset } from '@/lib/utils'
import type { Preset, Review, Purchase } from '@/types/database'
import { PurchaseButton } from './PurchaseButton'
import { ReviewSection } from './ReviewSection'
import { DemoGalleryClient } from './DemoGalleryClient'

interface Props {
  params: { id: string }
}

async function getPreset(id: string) {
  const supabase = createClient()
  // No is_published filter: RLS already restricts to published presets OR the
  // owner's own (draft) presets, so sellers can preview their drafts.
  const { data } = await supabase
    .from('presets')
    .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url, bio, total_sales)')
    .eq('id', id)
    .single()
  return data as Preset | null
}

async function getReviews(presetId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(id, username, display_name, avatar_url)')
    .eq('preset_id', presetId)
    .order('created_at', { ascending: false })
  return (data as Review[]) || []
}

async function getRelated(preset: Preset) {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url)')
    .eq('is_published', true)
    .eq('category', preset.category || '')
    .neq('id', preset.id)
    .limit(4)
  return (data as Preset[]) || []
}

async function getSellerStats(sellerId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('rating_avg, rating_count')
    .eq('seller_id', sellerId)
    .eq('is_published', true)
  const rows = (data as { rating_avg: number; rating_count: number }[]) || []
  const totalReviews = rows.reduce((s, r) => s + (r.rating_count || 0), 0)
  const weighted = rows.reduce((s, r) => s + (r.rating_avg || 0) * (r.rating_count || 0), 0)
  return {
    presetCount: rows.length,
    totalReviews,
    avg: totalReviews > 0 ? weighted / totalReviews : 0,
  }
}

async function getUserPurchase(presetId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('purchases')
    .select('*')
    .eq('preset_id', presetId)
    .eq('buyer_id', user.id)
    .eq('status', 'succeeded')
    .single()
  return data as Purchase | null
}

export async function generateMetadata({ params }: Props) {
  const preset = await getPreset(params.id)
  if (!preset) return { title: 'Preset not found' }
  return {
    title: preset.title,
    description: preset.description || `Buy ${preset.title} Lightroom preset`,
  }
}

export default async function PresetPage({ params }: Props) {
  const [preset, reviews, userPurchase] = await Promise.all([
    getPreset(params.id),
    getReviews(params.id),
    getUserPurchase(params.id),
  ])

  if (!preset) notFound()

  const related = await getRelated(preset)
  const sellerStats = preset.seller_id ? await getSellerStats(preset.seller_id) : null
  const fileExt = preset.file_name.split('.').pop()?.toUpperCase() || 'XMP'
  const demoPairs = preset.additional_demo_pairs || []
  const demo = isDemoPreset(preset)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          {/* Left: slider + demos + reviews */}
          <div className="space-y-8">
            {/* Before/after slider */}
            <div className="relative">
              <DemoGalleryClient
                mainBefore={preset.before_image_url}
                mainAfter={preset.after_image_url}
                additionalPairs={demoPairs}
              />
              {demo && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <span
                    className="font-extrabold tracking-[0.25em] text-white/70 text-6xl sm:text-7xl -rotate-12 select-none"
                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
                  >
                    DEMO
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {preset.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">About this preset</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {preset.description}
                </p>
              </div>
            )}

            {/* What's included */}
            {preset.whats_included && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#7c5cfc]" />
                  What&apos;s included
                </h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {preset.whats_included}
                </p>
              </div>
            )}

            {/* Tags */}
            {preset.tags && preset.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {preset.tags.map((tag) => (
                    <Link key={tag} href={`/browse?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:border-line-strong transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* About the author */}
            {preset.profiles && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">About the author</h2>
                <div className="bg-surface border border-line rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <Link
                      href={`/seller/${preset.profiles.username}`}
                      className="w-14 h-14 rounded-full bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      {preset.profiles.avatar_url ? (
                        <Image
                          src={preset.profiles.avatar_url}
                          alt={preset.profiles.display_name || preset.profiles.username}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-lg font-semibold text-[#7c5cfc]">
                          {(preset.profiles.display_name || preset.profiles.username)[0].toUpperCase()}
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/seller/${preset.profiles.username}`}
                        className="font-semibold text-foreground hover:text-[#7c5cfc] transition-colors"
                      >
                        {preset.profiles.display_name || preset.profiles.username}
                      </Link>
                      <p className="text-xs text-muted">@{preset.profiles.username}</p>

                      {/* Author rating + stats */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                        {sellerStats && sellerStats.totalReviews > 0 && (
                          <span className="flex items-center gap-1.5">
                            <StarRating value={Math.round(sellerStats.avg)} size="sm" />
                            <span className="text-muted">
                              {sellerStats.avg.toFixed(1)} ({sellerStats.totalReviews} review{sellerStats.totalReviews === 1 ? '' : 's'})
                            </span>
                          </span>
                        )}
                        {sellerStats && (
                          <span className="text-muted">
                            {sellerStats.presetCount} preset{sellerStats.presetCount === 1 ? '' : 's'}
                          </span>
                        )}
                        {typeof preset.profiles.total_sales === 'number' && preset.profiles.total_sales > 0 && (
                          <span className="text-muted">{preset.profiles.total_sales} sales</span>
                        )}
                      </div>

                      {preset.profiles.bio && (
                        <p className="text-sm text-muted leading-relaxed mt-3 whitespace-pre-line">
                          {preset.profiles.bio}
                        </p>
                      )}

                      <Link
                        href={`/seller/${preset.profiles.username}`}
                        className="inline-block text-sm text-[#7c5cfc] hover:underline mt-3"
                      >
                        View profile →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-base font-normal text-muted">({reviews.length})</span>
                )}
              </h2>
              <ReviewSection
                presetId={preset.id}
                reviews={reviews}
                ratingAvg={preset.rating_avg}
                ratingCount={preset.rating_count}
                userPurchase={userPurchase}
              />
            </div>
          </div>

          {/* Right: info panel */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-5">
            <div className="bg-surface border border-line rounded-2xl p-6 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {preset.category && (
                    <Badge variant="secondary" className="capitalize">{preset.category}</Badge>
                  )}
                  <Badge variant="outline" className="font-mono text-xs">.{fileExt}</Badge>
                </div>
                <h1 className="text-xl font-semibold text-foreground leading-snug mb-3">
                  {preset.title}
                </h1>

                {/* Seller */}
                {preset.profiles && (
                  <Link
                    href={`/seller/${preset.profiles.username}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {preset.profiles.avatar_url ? (
                        <Image
                          src={preset.profiles.avatar_url}
                          alt={preset.profiles.display_name || ''}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[#7c5cfc]">
                          {(preset.profiles.display_name || preset.profiles.username)[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                      {preset.profiles.display_name || preset.profiles.username}
                    </span>
                  </Link>
                )}
              </div>

              {/* Rating */}
              {preset.rating_count > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(preset.rating_avg)} size="sm" />
                  <span className="text-sm text-muted">
                    {preset.rating_avg.toFixed(1)} ({preset.rating_count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-foreground">
                  {formatPrice(preset.price_cents)}
                </span>
                <span className="text-sm text-muted">one-time</span>
              </div>

              {/* CTA */}
              {demo ? (
                <div className="space-y-2">
                  <Button className="w-full" size="lg" disabled>
                    Demo preset — not for sale
                  </Button>
                  <p className="text-xs text-center text-muted">
                    A sample listing showcasing how presets appear on PresetScout.
                  </p>
                </div>
              ) : userPurchase ? (
                <div className="space-y-3">
                  <a href={`/api/download/${userPurchase.id}`}>
                    <Button className="w-full" size="lg">
                      <Download className="h-4 w-4" />
                      Download Preset
                    </Button>
                  </a>
                  <p className="text-xs text-center text-muted">
                    Purchased {formatDate(userPurchase.created_at)}
                  </p>
                </div>
              ) : (
                <PurchaseButton preset={preset} />
              )}

              {/* Pack size */}
              {preset.preset_count ? (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Layers className="h-4 w-4 text-[#7c5cfc]" />
                  <span className="font-medium">{preset.preset_count}</span>
                  <span className="text-muted">presets in this pack</span>
                </div>
              ) : null}

              {/* Compatibility */}
              <div className="pt-2 border-t border-line space-y-3">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Compatible with
                </h3>
                {(preset.compatible_with && preset.compatible_with.length > 0
                  ? preset.compatible_with
                  : ['Lightroom Classic', 'Lightroom CC', 'Lightroom Mobile']
                ).map((label) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted">
                    <div className="w-5 h-5 rounded bg-overlay flex items-center justify-center">
                      <Monitor className="h-3 w-3" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>

              {/* File info */}
              <div className="flex items-center gap-2 text-xs text-muted">
                <FileCode2 className="h-3.5 w-3.5" />
                <span className="font-mono">{preset.file_name}</span>
              </div>

              {/* Download count */}
              <div className="text-xs text-muted">
                <Download className="h-3.5 w-3.5 inline mr-1" />
                {preset.downloads.toLocaleString()} downloads
              </div>
            </div>
          </div>
        </div>

        {/* Related presets */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-foreground mb-6">Related Presets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((rel) => (
                <PresetCard key={rel.id} preset={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
