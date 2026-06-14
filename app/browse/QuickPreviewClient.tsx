'use client'

import React, { useState } from 'react'
import { PresetCard } from '@/components/PresetCard'
import { QuickPreviewModal } from '@/components/QuickPreviewModal'
import type { Preset } from '@/types/database'

export function QuickPreviewClient({ presets }: { presets: Preset[] }) {
  const [previewPreset, setPreviewPreset] = useState<Preset | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onQuickPreview={setPreviewPreset}
          />
        ))}
      </div>
      <QuickPreviewModal
        preset={previewPreset}
        onClose={() => setPreviewPreset(null)}
      />
    </>
  )
}
