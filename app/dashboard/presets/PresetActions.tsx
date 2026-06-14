'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Preset } from '@/types/database'

export function PresetActions({ preset }: { preset: Preset }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const togglePublish = async () => {
    setLoading('publish')
    await supabase
      .from('presets')
      .update({ is_published: !preset.is_published })
      .eq('id', preset.id)
    router.refresh()
    setLoading(null)
  }

  const deletePreset = async () => {
    if (!confirm(`Delete "${preset.title}"? This cannot be undone.`)) return
    setLoading('delete')
    await supabase.from('presets').delete().eq('id', preset.id)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link href={`/dashboard/presets/${preset.id}/edit`}>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </Link>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={togglePublish}
        disabled={loading === 'publish'}
      >
        {loading === 'publish' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : preset.is_published ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:text-red-400"
        onClick={deletePreset}
        disabled={loading === 'delete'}
      >
        {loading === 'delete' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  )
}
