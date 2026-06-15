import type { SupabaseClient } from '@supabase/supabase-js'
import type { DiscountCode } from '@/types/database'

// Stripe's minimum chargeable amount for GBP is 30p. A code can't take a paid
// preset below this (without making it free), so we reject in that case.
export const MIN_CHARGE_CENTS = 30

/** Normalize codes so matching is case-insensitive and trimmed. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/** Discounted price (floored at 0), rounded to whole cents. */
export function applyDiscount(priceCents: number, percentOff: number): number {
  return Math.max(0, Math.round(priceCents * (1 - percentOff / 100)))
}

export interface DiscountResult {
  code?: DiscountCode
  discountedCents?: number
  error?: string
}

/**
 * Validate a code for a given seller + base price. Must run with an admin
 * client (buyers can't read other sellers' codes under RLS). Pure validation —
 * does not record a redemption; that happens in the webhook on success.
 */
export async function validateDiscount(
  admin: SupabaseClient,
  sellerId: string,
  code: string,
  priceCents: number
): Promise<DiscountResult> {
  const normalized = normalizeCode(code)
  if (!normalized) return { error: 'Enter a code.' }
  if (priceCents <= 0) return { error: 'This preset is already free.' }

  const { data } = await admin
    .from('discount_codes')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('code', normalized)
    .maybeSingle()

  const row = data as DiscountCode | null
  if (!row || !row.is_active) return { error: 'Invalid code.' }
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return { error: 'This code has expired.' }
  }
  if (row.max_uses != null && row.times_used >= row.max_uses) {
    return { error: 'This code has reached its usage limit.' }
  }

  const discountedCents = applyDiscount(priceCents, row.percent_off)
  if (discountedCents > 0 && discountedCents < MIN_CHARGE_CENTS) {
    return { error: "This code can't be applied to this preset." }
  }

  return { code: row, discountedCents }
}
