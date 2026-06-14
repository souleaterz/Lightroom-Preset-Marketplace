import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Simple in-memory rate limiter: purchase_id -> last request timestamp
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 10_000

export async function GET(
  _request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchaseId } = params

    // Rate limit
    const lastRequest = rateLimitMap.get(`${user.id}:${purchaseId}`)
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Rate limited. Please wait.' }, { status: 429 })
    }
    rateLimitMap.set(`${user.id}:${purchaseId}`, Date.now())

    // Verify purchase belongs to user
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*, presets(file_path, file_name)')
      .eq('id', purchaseId)
      .eq('buyer_id', user.id)
      .eq('status', 'succeeded')
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    const preset = (purchase as Record<string, unknown> & { presets?: { file_path: string; file_name: string } }).presets
    if (!preset?.file_path) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Generate signed URL (60 seconds)
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase.storage
      .from('preset-files')
      .createSignedUrl(preset.file_path, 60, {
        download: preset.file_name,
      })

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
    }

    return NextResponse.redirect(data.signedUrl)
  } catch (err: unknown) {
    console.error('Download error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
