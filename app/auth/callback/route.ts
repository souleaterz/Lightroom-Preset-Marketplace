import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') || '/'

  // Behind Vercel's proxy, request.url's origin can be an internal/http host.
  // Honor x-forwarded-host so the post-login redirect lands on the real site.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin

  // Provider returned an error (e.g. user cancelled, misconfigured OAuth)
  const providerError = searchParams.get('error_description') || searchParams.get('error')
  if (providerError && !code && !tokenHash) {
    return NextResponse.redirect(
      `${base}/auth/signin?error=${encodeURIComponent(providerError)}`
    )
  }

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${base}/auth/signin?error=missing_code`)
  }

  // Collect cookies the Supabase client wants to set, then attach them to the
  // redirect response so the session persists in the browser.
  const response = NextResponse.redirect(`${base}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let session = null
  let exchangeError = null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    session = data.session
    exchangeError = error
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    session = data.session
    exchangeError = error
  }

  if (exchangeError || !session) {
    return NextResponse.redirect(
      `${base}/auth/signin?error=${encodeURIComponent(exchangeError?.message ?? 'no_session')}`
    )
  }

  // Ensure a profile row exists for this user.
  const user = session.user
  const meta = user.user_metadata ?? {}
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

  return response
}
