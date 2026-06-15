import { NextResponse } from 'next/server'
import type { Stripe } from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preset_id } = await request.json()
    if (!preset_id) {
      return NextResponse.json({ error: 'preset_id required' }, { status: 400 })
    }

    // Get preset + seller
    const { data: preset } = await supabase
      .from('presets')
      .select('*, profiles!presets_seller_id_fkey(id, stripe_account_id, stripe_account_status, fee_waiver_until)')
      .eq('id', preset_id)
      .eq('is_published', true)
      .single()

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    if (typeof preset.file_path === 'string' && preset.file_path.startsWith('demo/')) {
      return NextResponse.json({ error: 'This is a demo preset and is not for sale.' }, { status: 400 })
    }

    if (preset.price_cents <= 0) {
      return NextResponse.json({ error: 'This preset is free — use /api/claim instead.' }, { status: 400 })
    }

    // Check not already purchased
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('preset_id', preset_id)
      .eq('status', 'succeeded')
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
    }

    const seller = (preset as Record<string, unknown> & {
      profiles?: { stripe_account_id?: string; stripe_account_status?: string; fee_waiver_until?: string | null }
    }).profiles
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // New creators are fee-free during their waiver window.
    const feeFree = !!seller?.fee_waiver_until && new Date(seller.fee_waiver_until).getTime() > Date.now()
    const feeAmount = feeFree ? 0 : Math.round(preset.price_cents * (PLATFORM_FEE_PERCENT / 100))

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: preset.title },
          unit_amount: preset.price_cents,
        },
        quantity: 1,
      }],
      metadata: {
        preset_id: preset.id,
        buyer_id: user.id,
        seller_id: preset.seller_id,
        platform_fee_cents: String(feeAmount),
      },
      success_url: `${siteUrl}/preset/${preset.id}?purchased=true`,
      cancel_url: `${siteUrl}/preset/${preset.id}`,
    }

    // Add Stripe Connect transfer if seller has active account.
    // Omit application_fee_amount entirely when fee-free (Stripe rejects 0).
    if (seller?.stripe_account_id && seller?.stripe_account_status === 'active') {
      sessionParams.payment_intent_data = {
        transfer_data: { destination: seller.stripe_account_id },
        ...(feeAmount > 0 ? { application_fee_amount: feeAmount } : {}),
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
