import Stripe from 'stripe'

// Fallback keeps the constructor from throwing during `next build` when
// STRIPE_SECRET_KEY is not set in the build environment. At runtime the
// real key must be present or the API routes will fail with a 500.
export const stripe = new Stripe(
  // Empty string in .env.local would throw; fallback keeps build from failing.
  // At runtime a real sk_live_/sk_test_ key must be present.
  process.env.STRIPE_SECRET_KEY || 'sk_test_build_placeholder_000000000000',
  { typescript: true }
)

// Overall platform fee: 10%. When a creator is referred by an affiliate, half
// of this (5%) is paid to the affiliate and the platform keeps the other 5%.
export const PLATFORM_FEE_PERCENT = parseInt(
  process.env.STRIPE_PLATFORM_FEE_PERCENT ?? '10',
  10
)

// Share of the overall fee paid out to a referring affiliate (5 of the 10%).
export const AFFILIATE_FEE_PERCENT = parseInt(
  process.env.STRIPE_AFFILIATE_FEE_PERCENT ?? '5',
  10
)

// New creators pay no platform fee for this many days after their first
// published preset.
export const NEW_CREATOR_FEE_FREE_DAYS = 30

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cents / 100)
}

export function centsToFloat(cents: number): number {
  return cents / 100
}
