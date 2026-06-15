'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface WishlistContextValue {
  /** Whether the given preset is currently in the signed-in user's wishlist. */
  isWishlisted: (presetId: string) => boolean
  /** Add/remove a preset from the wishlist. Redirects to sign-in if logged out. */
  toggle: (presetId: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [ids, setIds] = useState<Set<string>>(new Set())

  // Load the current user's wishlist once on mount.
  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return
      if (!user) {
        setUserId(null)
        setIds(new Set())
        return
      }
      setUserId(user.id)
      const { data } = await supabase
        .from('wishlists')
        .select('preset_id')
        .eq('user_id', user.id)
      if (active && data) {
        setIds(new Set(data.map((w: { preset_id: string }) => w.preset_id)))
      }
    })
    return () => {
      active = false
    }
  }, [supabase])

  const isWishlisted = useCallback((presetId: string) => ids.has(presetId), [ids])

  const toggle = useCallback(
    (presetId: string) => {
      if (!userId) {
        router.push(`/auth/signin?next=${encodeURIComponent(pathname || '/browse')}`)
        return
      }

      const wasWishlisted = ids.has(presetId)
      // Optimistic update.
      setIds((prev) => {
        const next = new Set(prev)
        if (wasWishlisted) next.delete(presetId)
        else next.add(presetId)
        return next
      })

      const op = wasWishlisted
        ? supabase.from('wishlists').delete().eq('user_id', userId).eq('preset_id', presetId)
        : supabase.from('wishlists').upsert(
            { user_id: userId, preset_id: presetId },
            { onConflict: 'user_id,preset_id' }
          )

      Promise.resolve(op).then(({ error }) => {
        if (error) {
          // Revert on failure.
          setIds((prev) => {
            const next = new Set(prev)
            if (wasWishlisted) next.add(presetId)
            else next.delete(presetId)
            return next
          })
        }
      })
    },
    [userId, ids, supabase, router, pathname]
  )

  return (
    <WishlistContext.Provider value={{ isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    // Safe no-op fallback if a card renders outside the provider.
    return { isWishlisted: () => false, toggle: () => {} }
  }
  return ctx
}
