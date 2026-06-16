export const dynamic = 'force-dynamic'

import React, { Suspense } from 'react'
import { Navbar } from '@/components/Navbar'
import { FilterSidebar } from '@/components/FilterSidebar'
import { BrowseGrid } from './BrowseGrid'
import { createClient } from '@/lib/supabase/server'
import { toCategoryList, categoryLabel } from '@/lib/categories'

async function getUsedCategories() {
  const supabase = createClient()
  const { data } = await supabase
    .from('presets')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
  return toCategoryList((data || []).map((r: { category: string | null }) => r.category))
}

export const metadata = {
  title: 'Browse Lightroom Presets',
  description:
    'Browse and buy Lightroom presets with live before/after previews. Filter by style — portrait, film, moody, bright and more — including free presets.',
  alternates: { canonical: '/browse' },
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const categories = await getUsedCategories()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Browse Presets</h1>
          <p className="text-muted mt-1">
            {searchParams.category && searchParams.category !== 'all'
              ? `${categoryLabel(searchParams.category)} presets`
              : 'All presets'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          <Suspense>
            <FilterSidebar categories={categories} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <Suspense fallback={<GridSkeleton />}>
              <BrowseGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-overlay" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-overlay rounded w-3/4" />
            <div className="h-3 bg-overlay rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
