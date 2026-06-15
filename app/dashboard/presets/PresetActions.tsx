'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Eye, EyeOff, Trash2, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { deletePreset } from './actions'
import type { Preset } from '@/types/database'

export function PresetActions({ preset }: { preset: Preset }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const togglePublish = async () => {
    setLoading('publish')
    await supabase
      .from('presets')
      .update({ is_published: !preset.is_published })
      .eq('id', preset.id)
    router.refresh()
    setLoading(null)
  }

  // Inline confirm instead of window.confirm(), which is unreliable in mobile
  // in-app browsers (Instagram/Facebook webviews silently swallow it).
  // Deletion runs server-side so it can clear FK-linked rows (wishlists,
  // reviews) with admin privileges.
  const handleDelete = async () => {
    setLoading('delete')
    const res = await deletePreset(preset.id)
    setConfirming(false)
    if (res.error) {
      setLoading(null)
      alert(res.error)
      return
    }
    router.refresh()
    setLoading(null)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-muted hidden sm:inline">Delete?</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={handleDelete}
          disabled={loading === 'delete'}
          aria-label="Confirm delete"
        >
          {loading === 'delete' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9"
          onClick={() => setConfirming(false)}
          disabled={loading === 'delete'}
          aria-label="Cancel delete"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <Link href={`/dashboard/presets/${preset.id}/edit`}>
        <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Edit preset">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        onClick={togglePublish}
        disabled={loading === 'publish'}
        aria-label={preset.is_published ? 'Unpublish preset' : 'Publish preset'}
      >
        {loading === 'publish' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : preset.is_published ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9 hover:text-red-400"
        onClick={() => setConfirming(true)}
        aria-label="Delete preset"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
