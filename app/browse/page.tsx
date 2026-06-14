export const dynamic = 'force-dynamic'

import React, { Suspense } from 'react'
import { Navbar } from '@/components/Navbar'
import { FilterSidebar } from '@/components/FilterSidebar'
import { BrowseGrid } from './BrowseGrid'

export const metadata = { title: 'Browse Presets' }

export default function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#f0f0f0]">Browse Presets</h1>
          <p className="text-[#888891] mt-1">
            {searchParams.category && searchParams.category !== 'all'
              ? `${searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)} presets`
              : 'All presets'}
          </p>
        </div>

        <div className="flex gap-8">
          <Suspense>
            <FilterSidebar />
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
        <div key={i} className="bg-[#111114] rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-white/5" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
