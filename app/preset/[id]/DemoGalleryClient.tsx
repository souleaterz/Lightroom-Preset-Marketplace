'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { cn } from '@/lib/utils'

interface DemoGalleryClientProps {
  mainBefore: string
  mainAfter: string
  additionalPairs: { before: string; after: string }[]
}

export function DemoGalleryClient({ mainBefore, mainAfter, additionalPairs }: DemoGalleryClientProps) {
  const allPairs = [{ before: mainBefore, after: mainAfter }, ...additionalPairs]
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div>
      <BeforeAfterSlider
        beforeSrc={allPairs[selectedIndex].before}
        afterSrc={allPairs[selectedIndex].after}
        className="w-full"
      />

      {allPairs.length > 1 && (
        <div className="flex gap-3 mt-4">
          {allPairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative flex-shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all',
                selectedIndex === idx
                  ? 'border-[#7c5cfc]'
                  : 'border-transparent opacity-60 hover:opacity-80'
              )}
            >
              <Image
                src={pair.after}
                alt={`Demo ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
