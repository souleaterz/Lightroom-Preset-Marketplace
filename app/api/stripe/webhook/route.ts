import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeCheckoutSession } from '@/lib/purchases'

export const runtime = 'nodejs'

type Admin = ReturnType<typeof createAdminClient>

/**
 * Handle a Stripe event by type, given a getter for the related object. Shared
 * by both the classic "snapshot" payload and the newer "thin" event-notification
 * payload, so the endpoint works whichever format the dashboard is configured for.
 * Type strings are matched with endsWith to tolerate any version prefix.
 */
async function handleEvent(
  type: string,
  getObject: () => unknown | Promise<unknown>,
  supabase: Admin
) {
  if (type.endsWith('checkout.session.completed')) {
    const session = (await getObject()) as Stripe.Checkout.Session
    await finalizeCheckoutSession(session, supabase)
    return
  }

  if (type.endsWith('account.updated')) {
    const account = (await getObject()) as Stripe.Account
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
    return
  }

  if (type.endsWith('charge.dispute.created')) {
    const dispute = (await getObject()) as Stripe.Dispute
    const { data: refunded } = await supabase
      .from('purchases')
      .update({ status: 'refunded' })
      .eq('stripe_payment_intent_id', dispute.payment_intent)
      .select('id')
      .single()
    if (refunded?.id) {
      await supabase
        .from('affiliate_commissions')
        .update({ status: 'reversed' })
        .eq('purchase_id', refunded.id)
        .eq('status', 'pending')
    }
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  const supabase = createAdminClient()

  // 1) Classic "snapshot" payload (stripe.webhooks.constructEvent).
  try {
    const event = stripe.webhooks.constructEvent(body, sig, secret)
    await handleEvent(event.type, () => event.data.object, supabase)
    return NextResponse.json({ received: true })
  } catch {
    // Not a snapshot payload (or signature failed) — try the thin format below.
  }

  // 2) New "thin" event-notification payload (Event Destinations).
  try {
    const notification = (await stripe.parseEventNotificationAsync(body, sig, secret)) as unknown as {
      type: string
      fetchRelatedObject: () => Promise<unknown>
    }
    await handleEvent(notification.type, () => notification.fetchRelatedObject(), supabase)
    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('Webhook error (both snapshot and thin failed):', (err as Error).message)
    return NextResponse.json({ error: 'Invalid signature or payload' }, { status: 400 })
  }
}
