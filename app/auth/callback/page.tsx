'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function handleCallback() {
      const supabase = createClient()
      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) {
        router.replace('/auth/signin?error=missing_code')
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.session) {
        router.replace(`/auth/signin?error=${encodeURIComponent(error?.message ?? 'no_session')}`)
        return
      }

      // Create profile row if this is a new user
      const user = data.session.user
      const meta = user.user_metadata
      const username =
        meta.username ||
        meta.preferred_username ||
        user.email?.split('@')[0] ||
        `user_${Date.now()}`

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30),
          display_name: meta.display_name || meta.full_name || username,
          avatar_url: meta.avatar_url || null,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      router.replace('/')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#888891] text-sm">Signing you in…</p>
    </div>
  )
}
