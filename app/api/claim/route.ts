import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Claim a free (£0) preset without going through Stripe. Records a succeeded
 * purchase so the normal /api/download flow works, then returns its id.
 */
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

    const { data: preset } = await supabase
      .from('presets')
      .select('id, price_cents, file_path')
      .eq('id', preset_id)
      .eq('is_published', true)
      .single()

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }
    if (preset.price_cents > 0) {
      return NextResponse.json({ error: 'This preset is not free.' }, { status: 400 })
    }
    if (typeof preset.file_path === 'string' && preset.file_path.startsWith('demo/')) {
      return NextResponse.json({ error: 'This is a demo preset and is not for download.' }, { status: 400 })
    }

    // Already claimed? Return the existing purchase so the download still works.
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('preset_id', preset_id)
      .eq('status', 'succeeded')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ purchase_id: existing.id })
    }

    const admin = createAdminClient()
    const { data: purchase, error } = await admin
      .from('purchases')
      .insert({
        buyer_id: user.id,
        preset_id,
        stripe_payment_intent_id: `free_${user.id}_${preset_id}`,
        amount_cents: 0,
        seller_payout_cents: 0,
        status: 'succeeded',
      })
      .select('id')
      .single()

    if (error || !purchase) {
      return NextResponse.json({ error: error?.message || 'Could not claim preset' }, { status: 500 })
    }

    await admin.rpc('increment_downloads', { preset_id })

    return NextResponse.json({ purchase_id: purchase.id })
  } catch (err: unknown) {
    console.error('Claim error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
