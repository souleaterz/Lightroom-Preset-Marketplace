export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const base = forwardedHost ? `https://${forwardedHost}` : url.origin

  if (!code) {
    return NextResponse.redirect(`${base}/auth/signin?error=missing_code`)
  }

  // Build the redirect response first so we can set cookies directly on it
  const successResponse = NextResponse.redirect(`${base}${next}`)
  const errorResponse = (msg: string) =>
    NextResponse.redirect(`${base}/auth/signin?error=${encodeURIComponent(msg)}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key_build_only',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return errorResponse(error.message)
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

  return successResponse
}
