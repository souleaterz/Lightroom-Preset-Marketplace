import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  preset_id: z.string().uuid(),
  purchase_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 })
    }
    const { preset_id, purchase_id, rating, body: reviewBody } = parsed.data

    // Verify purchase
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('id', purchase_id)
      .eq('buyer_id', user.id)
      .eq('preset_id', preset_id)
      .eq('status', 'succeeded')
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Must purchase preset before reviewing' }, { status: 403 })
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        buyer_id: user.id,
        preset_id,
        purchase_id,
        rating,
        body: reviewBody || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already reviewed this preset' }, { status: 409 })
      }
      throw error
    }

    // Update preset rating_avg and rating_count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('preset_id', preset_id)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / allReviews.length
      await supabase
        .from('presets')
        .update({ rating_avg: Math.round(avg * 100) / 100, rating_count: allReviews.length })
        .eq('id', preset_id)
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (err: unknown) {
    console.error('Review error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
