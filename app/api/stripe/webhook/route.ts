/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { commissionForFee } from '@/lib/affiliate'
import { sendPurchaseReceipt, sendSaleNotification } from '@/lib/email'
import { formatPrice } from '@/lib/utils'

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
      // Prefer the exact fee computed at checkout (accounts for fee-free creators).
      const feeCents =
        session.metadata?.platform_fee_cents != null
          ? parseInt(session.metadata.platform_fee_cents, 10)
          : Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100))
      const payoutCents = amountCents - feeCents

      const { data: purchaseRow } = await supabase.from('purchases').upsert({
        buyer_id,
        preset_id,
        stripe_payment_intent_id: session.payment_intent || session.id,
        amount_cents: amountCents,
        seller_payout_cents: payoutCents,
        status: 'succeeded',
      }, { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: false }).select('id').single()

      // Record discount-code usage (atomic, capped) if one was applied.
      if (session.metadata?.discount_code_id) {
        await supabase.rpc('redeem_discount_code', { code_id: session.metadata.discount_code_id })
      }

      // Record an affiliate commission if this creator was referred (one per
      // purchase). Half the platform fee; skipped when the sale was fee-free.
      if (seller_id && feeCents > 0 && purchaseRow?.id) {
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('referred_by')
          .eq('id', seller_id)
          .single()
        const affiliateId = (sellerProfile as { referred_by?: string | null } | null)?.referred_by
        const commissionCents = commissionForFee(feeCents)
        if (affiliateId && commissionCents > 0) {
          await supabase.from('affiliate_commissions').upsert({
            affiliate_id: affiliateId,
            purchase_id: purchaseRow.id,
            creator_id: seller_id,
            amount_cents: commissionCents,
            status: 'pending',
          }, { onConflict: 'purchase_id', ignoreDuplicates: true })
        }
      }

      // Increment download count on preset
      await supabase.rpc('increment_downloads', { preset_id })

      // Increment seller total_sales
      if (seller_id) {
        await supabase.rpc('increment_seller_sales', { seller_id })
      }

      // Transactional emails (no-op unless RESEND_API_KEY is set; never blocks).
      try {
        const { data: presetRow } = await supabase
          .from('presets')
          .select('title')
          .eq('id', preset_id)
          .single()
        const presetTitle = (presetRow?.title as string) || 'your preset'

        const buyerEmail =
          session.customer_details?.email ||
          (await supabase.auth.admin.getUserById(buyer_id)).data.user?.email
        if (buyerEmail) {
          await sendPurchaseReceipt({
            to: buyerEmail,
            presetTitle,
            amount: formatPrice(amountCents),
          })
        }

        if (seller_id) {
          const sellerEmail = (await supabase.auth.admin.getUserById(seller_id)).data.user?.email
          if (sellerEmail) {
            await sendSaleNotification({
              to: sellerEmail,
              presetTitle,
              payout: formatPrice(payoutCents),
            })
          }
        }
      } catch (err) {
        console.error('Purchase emails failed:', err)
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
