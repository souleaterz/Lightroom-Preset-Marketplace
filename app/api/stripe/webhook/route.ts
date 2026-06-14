/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const session = event.data.object as Stripe.Checkout.Session
    const { preset_id, buyer_id, seller_id } = session.metadata || {}

    if (preset_id && buyer_id && session.payment_status === 'paid') {
      const amountCents = session.amount_total || 0
      const feeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100))
      const payoutCents = amountCents - feeCents

      await supabase.from('purchases').upsert({
        buyer_id,
        preset_id,
        stripe_payment_intent_id: session.payment_intent || session.id,
        amount_cents: amountCents,
        seller_payout_cents: payoutCents,
        status: 'succeeded',
      }, { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: false })

      // Increment download count on preset
      await supabase.rpc('increment_downloads', { preset_id })

      // Increment seller total_sales
      if (seller_id) {
        await supabase.rpc('increment_seller_sales', { seller_id })
      }
    }
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
    await supabase
      .from('purchases')
      .update({ status: 'refunded' })
      .eq('stripe_payment_intent_id', dispute.payment_intent)
  }

  return NextResponse.json({ received: true })
}
