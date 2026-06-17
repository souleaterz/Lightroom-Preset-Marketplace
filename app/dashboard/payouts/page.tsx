import React from 'react'
import { redirect } from 'next/navigation'
import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { formatPrice } from '@/lib/utils'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Payouts' }

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: { connected?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard/payouts')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  let seller = profile as Profile | null

  // Reflect the live Stripe account state rather than trusting the return URL.
  let chargesEnabled = false
  if (seller?.stripe_account_id) {
    try {
      const account = await stripe.accounts.retrieve(seller.stripe_account_id)
      chargesEnabled = !!account.charges_enabled
      const liveStatus: Profile['stripe_account_status'] = account.charges_enabled
        ? 'active'
        : account.requirements?.disabled_reason
        ? 'restricted'
        : 'pending'
      if (seller.stripe_account_status !== liveStatus) {
        await createAdminClient()
          .from('profiles')
          .update({ stripe_account_status: liveStatus })
          .eq('id', user.id)
        seller = { ...seller, stripe_account_status: liveStatus }
      }
    } catch {
      // Stripe unreachable — fall back to stored status.
    }
  }
  const justReturned = searchParams.connected === 'true'

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .in('preset_id',
      (await supabase.from('presets').select('id').eq('seller_id', user.id)).data?.map((p: { id: string }) => p.id) || []
    )
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })

  const allPurchases = purchases || []
  const totalEarned = allPurchases.reduce((s: number, p: { seller_payout_cents?: number }) => s + (p.seller_payout_cents || 0), 0)

  const statusIcon = {
    active: <CheckCircle className="h-5 w-5 text-green-400" />,
    pending: <Clock className="h-5 w-5 text-amber-400" />,
    restricted: <AlertCircle className="h-5 w-5 text-red-400" />,
  }

  const statusColor = {
    active: 'default',
    pending: 'secondary',
    restricted: 'destructive',
  } as const

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Payouts</h1>
          <p className="text-muted mt-1">Manage your Stripe Connect account and earnings</p>
        </div>

        {justReturned && chargesEnabled && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300">Stripe account connected — payouts are enabled.</p>
          </div>
        )}
        {justReturned && !chargesEnabled && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              Stripe onboarding isn&apos;t finished yet. Click &quot;Continue setup&quot; below to complete it before you can receive payouts.
            </p>
          </div>
        )}

        {/* Stripe Connect status */}
        <div className="bg-surface border border-line rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Stripe Connect</h2>
            {seller?.stripe_account_status && (
              <Badge variant={statusColor[seller.stripe_account_status as keyof typeof statusColor] || 'secondary'}>
                {seller.stripe_account_status}
              </Badge>
            )}
          </div>

          {!seller?.stripe_account_id ? (
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground mb-1">Not connected</p>
                <p className="text-xs text-muted mb-4">
                  Connect your Stripe account to receive payouts from sales.
                </p>
                <a href="/api/stripe/connect/onboard">
                  <Button size="sm">Connect Stripe Account</Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {statusIcon[seller.stripe_account_status as keyof typeof statusIcon] || <Clock className="h-5 w-5 text-muted" />}
              <div>
                <p className="text-sm text-foreground">
                  {seller.stripe_account_status === 'active'
                    ? 'Payouts enabled. Earnings are deposited automatically.'
                    : seller.stripe_account_status === 'pending'
                    ? 'Account setup in progress. Complete your Stripe onboarding.'
                    : 'Account restricted. Check Stripe dashboard for details.'}
                </p>
              </div>
              <a href="/api/stripe/connect/onboard" className="ml-auto">
                <Button size="sm" variant={chargesEnabled ? 'outline' : 'default'}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  {chargesEnabled ? 'Manage' : 'Continue setup'}
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border border-line rounded-xl p-5">
            <p className="text-sm text-muted mb-2">Total Earned ({100 - PLATFORM_FEE_PERCENT}%)</p>
            <p className="font-mono text-2xl font-bold text-foreground">{formatPrice(totalEarned)}</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-5">
            <p className="text-sm text-muted mb-2">Platform Fee</p>
            <p className="font-mono text-2xl font-bold text-muted">{PLATFORM_FEE_PERCENT}%</p>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-surface border border-line rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Transaction History</h2>
          {allPurchases.length === 0 ? (
            <p className="text-sm text-muted">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {allPurchases.slice(0, 20).map((p: { id: string; created_at: string; seller_payout_cents?: number; amount_cents: number }) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-line last:border-0">
                  <div>
                    <p className="text-muted">Sale #{p.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted">
                      {new Date(p.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-green-400">+{formatPrice(p.seller_payout_cents || 0)}</p>
                    <p className="text-xs text-muted">Platform: {formatPrice(p.amount_cents - (p.seller_payout_cents || 0))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
