import { createAdminClient } from '@/lib/supabase/admin'
import { PLATFORM_FEE_PERCENT, AFFILIATE_FEE_PERCENT } from '@/lib/stripe'
import { siteConfig } from '@/lib/site'

type Admin = ReturnType<typeof createAdminClient>

// Affiliate's share of each platform fee (5 of 10% = half the fee).
const AFFILIATE_SHARE = PLATFORM_FEE_PERCENT > 0 ? AFFILIATE_FEE_PERCENT / PLATFORM_FEE_PERCENT : 0.5

function randomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

/** A short code unique across profiles. */
export async function generateAffiliateCode(admin: Admin): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = randomCode()
    const { data } = await admin.from('profiles').select('id').eq('affiliate_code', code).maybeSingle()
    if (!data) return code
  }
  return randomCode() + Date.now().toString(36).slice(-3).toUpperCase()
}

/** Enroll a user as an affiliate (idempotent), returning their code. */
export async function ensureAffiliate(
  userId: string,
  profile?: { is_affiliate?: boolean | null; affiliate_code?: string | null } | null
): Promise<string> {
  if (profile?.is_affiliate && profile?.affiliate_code) return profile.affiliate_code
  const admin = createAdminClient()
  const code = profile?.affiliate_code || (await generateAffiliateCode(admin))
  await admin.from('profiles').update({ is_affiliate: true, affiliate_code: code }).eq('id', userId)
  return code
}

/**
 * Attribute a newly-converted seller to the affiliate whose code they arrived
 * with. First-touch and one-time only (never overwrites an existing referrer,
 * never self-refers).
 */
export async function attributeReferral(userId: string, refCode?: string | null): Promise<void> {
  if (!refCode) return
  const admin = createAdminClient()
  const { data: affiliate } = await admin
    .from('profiles')
    .select('id, is_affiliate')
    .eq('affiliate_code', refCode.toUpperCase())
    .maybeSingle()
  if (!affiliate || !affiliate.is_affiliate || affiliate.id === userId) return
  await admin.from('profiles').update({ referred_by: affiliate.id }).eq('id', userId).is('referred_by', null)
}

export interface AffiliateCreator {
  id: string
  username: string
  displayName: string | null
  joinedAt: string
  isSeller: boolean
  salesCount: number
  grossCents: number
  earningsCents: number
}

export interface AffiliateData {
  code: string
  referralUrl: string
  totalCreators: number
  activeCreators: number
  salesCount: number
  grossCents: number
  earningsCents: number
  creators: AffiliateCreator[]
}

/** Analytics for an affiliate: referred creators and earnings from their sales. */
export async function getAffiliateData(affiliateId: string, code: string): Promise<AffiliateData> {
  const admin = createAdminClient()

  const { data: creatorRows } = await admin
    .from('profiles')
    .select('id, username, display_name, created_at, is_seller')
    .eq('referred_by', affiliateId)
    .order('created_at', { ascending: false })

  const creators = creatorRows || []
  const ids = creators.map((c: { id: string }) => c.id)

  const agg = new Map<string, { sales: number; gross: number; earn: number }>()
  ids.forEach((id: string) => agg.set(id, { sales: 0, gross: 0, earn: 0 }))

  if (ids.length) {
    const { data: presetRows } = await admin.from('presets').select('id, seller_id').in('seller_id', ids)
    const sellerByPreset = new Map<string, string>(
      (presetRows || []).map((p: { id: string; seller_id: string }) => [p.id, p.seller_id])
    )
    const presetIds = (presetRows || []).map((p: { id: string }) => p.id)

    if (presetIds.length) {
      const { data: purchases } = await admin
        .from('purchases')
        .select('preset_id, amount_cents, seller_payout_cents, status')
        .in('preset_id', presetIds)
        .eq('status', 'succeeded')

      for (const p of purchases || []) {
        const sellerId = sellerByPreset.get(p.preset_id)
        if (!sellerId) continue
        const a = agg.get(sellerId)
        if (!a) continue
        const fee = (p.amount_cents || 0) - (p.seller_payout_cents || 0)
        a.sales += 1
        a.gross += p.amount_cents || 0
        a.earn += Math.max(0, Math.round(fee * AFFILIATE_SHARE))
      }
    }
  }

  const creatorList: AffiliateCreator[] = creators.map(
    (c: { id: string; username: string; display_name: string | null; created_at: string; is_seller: boolean }) => {
      const a = agg.get(c.id) || { sales: 0, gross: 0, earn: 0 }
      return {
        id: c.id,
        username: c.username,
        displayName: c.display_name,
        joinedAt: c.created_at,
        isSeller: !!c.is_seller,
        salesCount: a.sales,
        grossCents: a.gross,
        earningsCents: a.earn,
      }
    }
  )

  const totals = creatorList.reduce(
    (t, c) => ({ sales: t.sales + c.salesCount, gross: t.gross + c.grossCents, earn: t.earn + c.earningsCents }),
    { sales: 0, gross: 0, earn: 0 }
  )

  return {
    code,
    referralUrl: `${siteConfig.url}/sell?ref=${code}`,
    totalCreators: creators.length,
    activeCreators: creatorList.filter((c) => c.isSeller && c.salesCount > 0).length,
    salesCount: totals.sales,
    grossCents: totals.gross,
    earningsCents: totals.earn,
    creators: creatorList,
  }
}
