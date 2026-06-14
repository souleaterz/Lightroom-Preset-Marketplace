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

export const PLATFORM_FEE_PERCENT = parseInt(
  process.env.STRIPE_PLATFORM_FEE_PERCENT ?? '15',
  10
)

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cents / 100)
}

export function centsToFloat(cents: number): number {
  return cents / 100
}
