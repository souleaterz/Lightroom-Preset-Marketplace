import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cents / 100)
}

/** Like formatPrice, but shows "Free" for £0 presets. Use for listing prices. */
export function formatPresetPrice(cents: number): string {
  return cents <= 0 ? 'Free' : formatPrice(cents)
}

/** A preset with a £0 price that buyers can claim without checkout. */
export function isFreePreset(preset: { price_cents: number }): boolean {
  return preset.price_cents <= 0
}

/** A bundle is a preset row that groups other presets into a discounted pack. */
export function isBundle(preset: { bundle_preset_ids?: string[] | null }): boolean {
  return !!preset.bundle_preset_ids && preset.bundle_preset_ids.length > 0
}

/** Sales threshold at which a seller earns the automatic "Top Seller" badge. */
export const TOP_SELLER_MIN_SALES = 50

export type SellerBadgeType = 'verified' | 'top'

/**
 * The trust badge a seller has earned, if any. Manual verification outranks the
 * automatic top-seller tier. Computed from fields present on the profiles join.
 */
export function getSellerBadge(
  profile?: { is_verified?: boolean | null; total_sales?: number | null } | null
): SellerBadgeType | null {
  if (!profile) return null
  if (profile.is_verified) return 'verified'
  if ((profile.total_sales ?? 0) >= TOP_SELLER_MIN_SALES) return 'top'
  return null
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

/** Demo/sample presets are stored under a "demo/" path and aren't for sale. */
export function isDemoPreset(preset: { file_path?: string | null }): boolean {
  return !!preset.file_path && preset.file_path.startsWith('demo/')
}

/**
 * Whether a profile is a seller. Members start as buyers and opt in via the
 * "Become a Seller" flow. Existing accounts that already onboarded with Stripe
 * are treated as sellers too, so they keep dashboard access after the role split.
 */
export function isSellerProfile(
  profile?: { is_seller?: boolean | null; stripe_account_id?: string | null } | null
): boolean {
  return !!(profile?.is_seller || profile?.stripe_account_id)
}
