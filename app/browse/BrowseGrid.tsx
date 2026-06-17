import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuickPreviewClient } from './QuickPreviewClient'
import type { Preset } from '@/types/database'

interface BrowseGridProps {
  searchParams: { [key: string]: string | undefined }
}

async function getPresets(params: BrowseGridProps['searchParams']): Promise<Preset[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('presets')
      .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url, is_verified, is_founder, total_sales)')
      .eq('is_published', true)

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }
    if (params.free === '1') {
      query = query.eq('price_cents', 0)
    }
    if (params.min_price) {
      query = query.gte('price_cents', parseInt(params.min_price) * 100)
    }
    if (params.max_price) {
      query = query.lte('price_cents', parseInt(params.max_price) * 100)
    }
    if (params.min_rating) {
      query = query.gte('rating_avg', parseFloat(params.min_rating))
    }
    if (params.tag) {
      query = query.contains('tags', [params.tag])
    }

    const sort = params.sort || 'newest'
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'best_rated') query = query.order('rating_avg', { ascending: false })
    else if (sort === 'most_popular') query = query.order('downloads', { ascending: false })
    else if (sort === 'price_asc') query = query.order('price_cents', { ascending: true })
    else if (sort === 'price_desc') query = query.order('price_cents', { ascending: false })

    const page = parseInt(params.page || '1')
    const pageSize = 24
    query = query.range((page - 1) * pageSize, page * pageSize - 1)

    const { data } = await query
    return (data as Preset[]) || []
  } catch {
    return []
  }
}

export async function BrowseGrid({ searchParams }: BrowseGridProps) {
  const presets = await getPresets(searchParams)

  if (presets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No presets found</h3>
        <p className="text-muted">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <QuickPreviewClient presets={presets} />
  )
}
