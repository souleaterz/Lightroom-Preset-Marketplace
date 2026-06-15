import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key_build_only',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: refresh the session so the auth token cookie stays valid.
  // Do not run any other logic between createServerClient and getUser().
  await supabase.auth.getUser()

  // Affiliate referral capture: ?ref=CODE → cookie, attributed when the visitor
  // later becomes a seller. First-touch wins (don't overwrite an existing ref).
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && /^[A-Za-z0-9]{4,16}$/.test(ref) && !request.cookies.get('ps_ref')) {
    supabaseResponse.cookies.set('ps_ref', ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
      sameSite: 'lax',
    })
  }

  return supabaseResponse
}
