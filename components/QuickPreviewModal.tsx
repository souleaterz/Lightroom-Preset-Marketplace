'use client'

import React from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { Preset } from '@/types/database'

interface QuickPreviewModalProps {
  preset: Preset | null
  onClose: () => void
}

export function QuickPreviewModal({ preset, onClose }: QuickPreviewModalProps) {
  if (!preset) return null

  return (
    <Dialog open={!!preset} onClose={onClose} className="w-full max-w-3xl">
      <DialogHeader>
        <DialogTitle>{preset.title}</DialogTitle>
        {preset.profiles && (
          <p className="text-sm text-muted mt-1">
            by {preset.profiles.display_name || preset.profiles.username}
          </p>
        )}
      </DialogHeader>
      <DialogContent>
        <BeforeAfterSlider
          beforeSrc={preset.before_image_url}
          afterSrc={preset.after_image_url}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-semibold text-foreground">
            {formatPrice(preset.price_cents)}
          </span>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link href={`/preset/${preset.id}`}>
              <Button size="sm">View Preset</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
