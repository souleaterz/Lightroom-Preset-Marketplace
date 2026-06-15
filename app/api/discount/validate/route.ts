import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateDiscount } from '@/lib/discounts'

/** Check a discount code against a preset and return the discounted price. */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preset_id, code } = await request.json()
    if (!preset_id || !code) {
      return NextResponse.json({ error: 'preset_id and code required' }, { status: 400 })
    }

    const { data: preset } = await supabase
      .from('presets')
      .select('seller_id, price_cents')
      .eq('id', preset_id)
      .eq('is_published', true)
      .single()

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    const admin = createAdminClient()
    const result = await validateDiscount(admin, preset.seller_id, code, preset.price_cents)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      percent_off: result.code!.percent_off,
      discounted_cents: result.discountedCents,
      original_cents: preset.price_cents,
    })
  } catch (err: unknown) {
    console.error('Discount validate error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
