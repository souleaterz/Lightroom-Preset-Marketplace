import type { Stripe } from 'stripe'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { commissionForFee } from '@/lib/affiliate'
import { sendPurchaseReceipt, sendSaleNotification } from '@/lib/email'
import { formatPrice } from '@/lib/utils'

type Admin = ReturnType<typeof createAdminClient>

/**
 * Record a completed Stripe Checkout as a purchase and run the one-time side
 * effects (download/sales counters, affiliate commission, discount redemption,
 * emails). Idempotent: safe to call multiple times for the same session — from
 * the webhook AND the post-checkout reconciliation — without double-counting.
 */
export async function finalizeCheckoutSession(
  session: Stripe.Checkout.Session,
  admin: Admin = createAdminClient()
): Promise<{ isNew: boolean; purchaseId?: string }> {
  const { preset_id, buyer_id, seller_id } = session.metadata || {}
  if (!preset_id || !buyer_id || session.payment_status !== 'paid') {
    return { isNew: false }
  }

  const amountCents = session.amount_total || 0
  const feeCents =
    session.metadata?.platform_fee_cents != null
      ? parseInt(session.metadata.platform_fee_cents, 10)
      : Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100))
  const payoutCents = amountCents - feeCents
  const paymentIntentId =
    (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id) ||
    session.id

  // Insert once. ignoreDuplicates => a returned row means WE created it, so the
  // side effects below run exactly once even across retries / concurrent calls.
  const { data: inserted } = await admin
    .from('purchases')
    .upsert(
      {
        buyer_id,
        preset_id,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: amountCents,
        seller_payout_cents: payoutCents,
        status: 'succeeded',
      },
      { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
    )
    .select('id')

  let purchaseId = inserted?.[0]?.id as string | undefined
  const isNew = !!purchaseId
  if (!purchaseId) {
    const { data } = await admin
      .from('purchases')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle()
    purchaseId = data?.id as string | undefined
  }

  if (!isNew) return { isNew: false, purchaseId }

  // ---- one-time side effects ----
  if (session.metadata?.discount_code_id) {
    await admin.rpc('redeem_discount_code', { code_id: session.metadata.discount_code_id })
  }
  await admin.rpc('increment_downloads', { preset_id })
  if (seller_id) {
    await admin.rpc('increment_seller_sales', { seller_id })
  }

  if (seller_id && feeCents > 0 && purchaseId) {
    const { data: sellerProfile } = await admin
      .from('profiles')
      .select('referred_by')
      .eq('id', seller_id)
      .single()
    const affiliateId = (sellerProfile as { referred_by?: string | null } | null)?.referred_by
    const commissionCents = commissionForFee(feeCents)
    if (affiliateId && commissionCents > 0) {
      await admin.from('affiliate_commissions').upsert(
        {
          affiliate_id: affiliateId,
          purchase_id: purchaseId,
          creator_id: seller_id,
          amount_cents: commissionCents,
          status: 'pending',
        },
        { onConflict: 'purchase_id', ignoreDuplicates: true }
      )
    }
  }

  // Transactional emails (no-op unless RESEND_API_KEY is set; never blocks).
  try {
    const { data: presetRow } = await admin.from('presets').select('title').eq('id', preset_id).single()
    const presetTitle = (presetRow?.title as string) || 'your preset'

    const buyerEmail =
      session.customer_details?.email ||
      (await admin.auth.admin.getUserById(buyer_id)).data.user?.email
    if (buyerEmail) {
      await sendPurchaseReceipt({ to: buyerEmail, presetTitle, amount: formatPrice(amountCents) })
    }
    if (seller_id) {
      const sellerEmail = (await admin.auth.admin.getUserById(seller_id)).data.user?.email
      if (sellerEmail) {
        await sendSaleNotification({ to: sellerEmail, presetTitle, payout: formatPrice(payoutCents) })
      }
    }
  } catch (err) {
    console.error('Purchase emails failed:', err)
  }

  return { isNew: true, purchaseId }
}

/**
 * Fallback used on the post-checkout return page: verify the session belongs to
 * the signed-in buyer, then finalize it if the webhook hasn't already. Ensures
 * the download unlocks even if the webhook is delayed or misconfigured.
 */
export async function reconcileCheckoutForUser(
  sessionId: string,
  userId: string
): Promise<void> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.metadata?.buyer_id !== userId) return // not this user's session
    await finalizeCheckoutSession(session)
  } catch (err) {
    console.error('reconcileCheckoutForUser failed:', err)
  }
}
