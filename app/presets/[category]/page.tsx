import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { QuickPreviewClient } from '@/app/browse/QuickPreviewClient'
import { createClient } from '@/lib/supabase/server'
import {
  categoryLabel,
  normalizeCategory,
  isCuratedCategory,
  toCategoryList,
} from '@/lib/categories'
import { siteConfig } from '@/lib/site'
import type { Preset } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: { category: string }
}

async function getPresets(slug: string): Promise<Preset[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url, is_verified, total_sales)')
    .eq('is_published', true)
    .eq('category', slug)
    .order('created_at', { ascending: false })
    .limit(60)
  return (data as Preset[]) || []
}

async function getOtherCategories(currentSlug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
  return toCategoryList((data || []).map((r: { category: string | null }) => r.category)).filter(
    (c) => c.value !== currentSlug
  )
}

function intro(label: string): string {
  const l = label.toLowerCase()
  return `Discover the best ${l} Lightroom presets from independent creators on ${siteConfig.name}. Every ${l} preset has a live before/after preview on real photos, works with Lightroom Classic, CC and mobile, and is yours forever after a one-time purchase.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeCategory(params.category)
  const label = categoryLabel(slug)
  const presets = await getPresets(slug)
  const hasPresets = presets.length > 0
  const title = `${label} Lightroom Presets`
  const description = hasPresets
    ? `Browse ${presets.length} ${label.toLowerCase()} Lightroom preset${presets.length === 1 ? '' : 's'} with live before/after previews. ${siteConfig.name} — buy once, own forever.`
    : intro(label)
  return {
    title,
    description,
    alternates: { canonical: `/presets/${slug}` },
    // Don't index empty curated category pages (thin content) until they have presets.
    robots: hasPresets ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/presets/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const slug = normalizeCategory(params.category)
  const [presets, otherCategories] = await Promise.all([getPresets(slug), getOtherCategories(slug)])

  // Unknown category with no presets → 404. Curated-but-empty still renders
  // (noindex via metadata) so it's a valid landing page before it fills up.
  if (presets.length === 0 && !isCuratedCategory(slug)) notFound()

  const label = categoryLabel(slug)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const itemListLd = presets.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${label} Lightroom Presets`,
        itemListElement: presets.slice(0, 24).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${siteConfig.url}/preset/${p.id}`,
          name: p.title,
        })),
      }
    : null

  return (
    <div className="min-h-screen">
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-4">
          <Link href="/browse" className="hover:text-foreground">Browse</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{label}</span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold text-foreground mb-3">{label} Lightroom Presets</h1>
          <p className="text-muted leading-relaxed">{intro(label)}</p>
        </header>

        {presets.length > 0 ? (
          <QuickPreviewClient presets={presets} />
        ) : (
          <div className="text-center py-16 bg-surface border border-line rounded-2xl">
            <p className="text-foreground font-medium mb-2">No {label.toLowerCase()} presets yet</p>
            <p className="text-muted mb-6">Be the first — or explore other styles.</p>
            <Link href="/browse" className="text-[#7c5cfc] hover:underline">Browse all presets →</Link>
          </div>
        )}

        {/* Internal links to other categories */}
        {otherCategories.length > 0 && (
          <div className="mt-14 border-t border-line pt-8">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
              Explore other categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCategories.map((c) => (
                <Link
                  key={c.value}
                  href={`/presets/${c.value}`}
                  className="px-3.5 py-1.5 rounded-full text-sm border border-line text-muted hover:text-foreground hover:border-line-strong transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
