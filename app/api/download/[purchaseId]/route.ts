import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Simple in-memory rate limiter: purchase_id -> last request timestamp
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 10_000

export async function GET(
  request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchaseId } = params
    // Optional: download a specific preset that belongs to a purchased bundle.
    const memberId = new URL(request.url).searchParams.get('preset')

    // Rate limit (keyed by the specific file being requested).
    const rateKey = `${user.id}:${purchaseId}:${memberId || 'main'}`
    const lastRequest = rateLimitMap.get(rateKey)
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Rate limited. Please wait.' }, { status: 429 })
    }
    rateLimitMap.set(rateKey, Date.now())

    // Verify purchase belongs to user
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*, presets(file_path, file_name, bundle_preset_ids)')
      .eq('id', purchaseId)
      .eq('buyer_id', user.id)
      .eq('status', 'succeeded')
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    const purchased = (purchase as Record<string, unknown> & {
      presets?: { file_path: string | null; file_name: string | null; bundle_preset_ids: string[] | null }
    }).presets

    const adminSupabase = createAdminClient()

    // Resolve which file to serve: a bundle member, or the preset's own file.
    let filePath: string | null | undefined = purchased?.file_path
    let fileName: string | null | undefined = purchased?.file_name

    if (memberId) {
      const bundleIds = purchased?.bundle_preset_ids || []
      if (!bundleIds.includes(memberId)) {
        return NextResponse.json({ error: 'Preset not part of this purchase' }, { status: 403 })
      }
      const { data: member } = await adminSupabase
        .from('presets')
        .select('file_path, file_name')
        .eq('id', memberId)
        .single()
      filePath = member?.file_path
      fileName = member?.file_name
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Generate signed URL (60 seconds)
    const { data, error } = await adminSupabase.storage
      .from('preset-files')
      .createSignedUrl(filePath, 60, {
        download: fileName || undefined,
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
