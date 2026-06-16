import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { MIN_PAYOUT_CENTS, PAYOUT_HOLD_DAYS } from '@/lib/affiliate'

/**
 * Cash out an affiliate's available (matured, unpaid) commissions via a Stripe
 * transfer to their connected account. Claims commissions atomically before the
 * transfer and reverts them if the transfer fails, so balances never drift.
 */
export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    const stripeAccountId = (profile as { stripe_account_id?: string | null } | null)?.stripe_account_id
    if (!stripeAccountId) {
      return NextResponse.json({ error: 'Connect a Stripe account first to receive payouts.' }, { status: 400 })
    }

    // Confirm the connected account can actually receive transfers.
    const account = await stripe.accounts.retrieve(stripeAccountId)
    const canReceive = account.capabilities?.transfers === 'active' || account.payouts_enabled
    if (!canReceive) {
      return NextResponse.json(
        { error: 'Your Stripe account setup isn’t complete yet. Finish onboarding before cashing out.' },
        { status: 400 }
      )
    }

    const cutoff = new Date(Date.now() - PAYOUT_HOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()

    // Create the payout shell first, then atomically claim matured commissions
    // into it. The `status = 'pending'` filter makes concurrent cash-outs safe.
    const { data: payout, error: payoutErr } = await admin
      .from('affiliate_payouts')
      .insert({ affiliate_id: user.id, amount_cents: 0, status: 'pending' })
      .select('id')
      .single()
    if (payoutErr || !payout) {
      return NextResponse.json({ error: 'Could not start payout.' }, { status: 500 })
    }
    const payoutId = payout.id as string

    const { data: claimed } = await admin
      .from('affiliate_commissions')
      .update({ status: 'paid', payout_id: payoutId })
      .eq('affiliate_id', user.id)
      .eq('status', 'pending')
      .lte('created_at', cutoff)
      .select('amount_cents')

    const amountCents = (claimed || []).reduce(
      (s: number, c: { amount_cents: number }) => s + c.amount_cents,
      0
    )

    const revert = async () => {
      await admin
        .from('affiliate_commissions')
        .update({ status: 'pending', payout_id: null })
        .eq('payout_id', payoutId)
    }

    if (amountCents < MIN_PAYOUT_CENTS) {
      await revert()
      await admin.from('affiliate_payouts').delete().eq('id', payoutId)
      return NextResponse.json(
        { error: `You need at least £${(MIN_PAYOUT_CENTS / 100).toFixed(0)} of cleared earnings to cash out.` },
        { status: 400 }
      )
    }

    await admin.from('affiliate_payouts').update({ amount_cents: amountCents }).eq('id', payoutId)

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: amountCents,
          currency: 'gbp',
          destination: stripeAccountId,
          metadata: { affiliate_id: user.id, payout_id: payoutId },
        },
        { idempotencyKey: `affiliate_payout_${payoutId}` }
      )
      await admin
        .from('affiliate_payouts')
        .update({ status: 'paid', stripe_transfer_id: transfer.id })
        .eq('id', payoutId)

      return NextResponse.json({ paid_cents: amountCents })
    } catch (transferErr: unknown) {
      // Transfer failed — release the commissions so the balance is restored.
      await revert()
      await admin.from('affiliate_payouts').update({ status: 'failed' }).eq('id', payoutId)
      console.error('Affiliate transfer failed:', transferErr)
      return NextResponse.json(
        { error: 'Payout failed to send. Your balance is unchanged — please try again later.' },
        { status: 500 }
      )
    }
  } catch (err: unknown) {
    console.error('Affiliate payout error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
