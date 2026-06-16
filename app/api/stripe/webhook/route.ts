import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeCheckoutSession } from '@/lib/purchases'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    console.error('Webhook signature error:', (err as Error).message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    // All recording + side effects live in finalizeCheckoutSession (idempotent),
    // shared with the post-checkout reconciliation fallback.
    await finalizeCheckoutSession(event.data.object as Stripe.Checkout.Session, supabase)
  }

  if (event.type === 'payment_intent.succeeded') {
    // Handled via checkout.session.completed above
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account
    const status =
      account.charges_enabled && account.payouts_enabled
        ? 'active'
        : account.requirements?.disabled_reason
        ? 'restricted'
        : 'pending'

    await supabase
      .from('profiles')
      .update({ stripe_account_status: status })
      .eq('stripe_account_id', account.id)
  }

  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute
    const { data: refunded } = await supabase
      .from('purchases')
      .update({ status: 'refunded' })
      .eq('stripe_payment_intent_id', dispute.payment_intent)
      .select('id')
      .single()

    // Claw back any not-yet-paid affiliate commission for this sale.
    if (refunded?.id) {
      await supabase
        .from('affiliate_commissions')
        .update({ status: 'reversed' })
        .eq('purchase_id', refunded.id)
        .eq('status', 'pending')
    }
  }

  return NextResponse.json({ received: true })
}
