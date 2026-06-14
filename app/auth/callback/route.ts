import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=missing_code`)
  }

  const pending: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach((c) => pending.push(c as typeof pending[number]))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(error?.message ?? 'no_session')}`
    )
  }

  const user = data.session.user
  const meta = user.user_metadata
  const rawUsername =
    meta.username ||
    meta.preferred_username ||
    user.email?.split('@')[0] ||
    `user_${Date.now()}`
  const username = String(rawUsername).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      username,
      display_name: meta.display_name || meta.full_name || rawUsername,
      avatar_url: meta.avatar_url || null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  const response = NextResponse.redirect(`${origin}/`)
  pending.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )
  return response
}
