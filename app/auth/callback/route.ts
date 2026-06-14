export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/'

  // On Vercel, request.url may have an internal HTTP origin.
  // Use x-forwarded-host to build the correct public HTTPS base URL.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const base = forwardedHost ? `https://${forwardedHost}` : url.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(`${base}/auth/signin?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      const meta = data.user.user_metadata
      const username =
        meta.username ||
        meta.preferred_username ||
        data.user.email?.split('@')[0] ||
        `user_${Date.now()}`

      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30),
          display_name: meta.display_name || meta.full_name || username,
          avatar_url: meta.avatar_url || null,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    }

    return NextResponse.redirect(`${base}${next}`)
  }

  // No code — redirect to sign in
  return NextResponse.redirect(`${base}/auth/signin?error=missing_code`)
}
