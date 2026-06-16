import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect('/auth/signin')

    // Where to send the seller/affiliate back to after onboarding. Only allow
    // internal paths to avoid open-redirects.
    const nextParam = new URL(request.url).searchParams.get('next')
    const returnPath = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard/payouts'

    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('stripe_account_id, username')
      .eq('id', user.id)
      .single()

    let accountId = profile?.stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: { user_id: user.id },
      })
      accountId = account.id
      await adminSupabase
        .from('profiles')
        .update({ stripe_account_id: accountId, stripe_account_status: 'pending' })
        .eq('id', user.id)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const sep = returnPath.includes('?') ? '&' : '?'
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}${returnPath}`,
      return_url: `${siteUrl}${returnPath}${sep}connected=true`,
      type: 'account_onboarding',
    })

    return NextResponse.redirect(accountLink.url)
  } catch (err: unknown) {
    console.error('Connect onboard error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
