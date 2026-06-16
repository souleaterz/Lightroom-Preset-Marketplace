export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  stripe_account_id: string | null
  stripe_account_status: 'pending' | 'active' | 'restricted' | null
  is_seller: boolean
  is_verified: boolean
  is_affiliate: boolean
  affiliate_code: string | null
  referred_by: string | null
  fee_waiver_until: string | null
  total_sales: number
  created_at: string
}

export interface Preset {
  id: string
  seller_id: string
  title: string
  description: string | null
  price_cents: number
  category: string | null
  tags: string[] | null
  before_image_url: string
  after_image_url: string
  additional_demo_pairs: { before: string; after: string }[] | null
  bundle_preset_ids: string[] | null
  file_path: string | null
  file_name: string | null
  compatible_with: string[] | null
  whats_included: string | null
  preset_count: number | null
  downloads: number
  rating_avg: number
  rating_count: number
  is_published: boolean
  new_release_notified?: boolean
  created_at: string
  profiles?: Profile
}

export interface Purchase {
  id: string
  buyer_id: string
  preset_id: string
  stripe_payment_intent_id: string | null
  amount_cents: number | null
  seller_payout_cents: number | null
  status: 'pending' | 'succeeded' | 'refunded'
  created_at: string
  presets?: Preset
  profiles?: Profile
}

export interface Review {
  id: string
  buyer_id: string
  preset_id: string
  purchase_id: string
  rating: number
  body: string | null
  created_at: string
  profiles?: Profile
}

export interface DiscountCode {
  id: string
  seller_id: string
  code: string
  percent_off: number
  max_uses: number | null
  times_used: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Follow {
  follower_id: string
  seller_id: string
  created_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  purchase_id: string
  creator_id: string | null
  amount_cents: number
  status: 'pending' | 'paid' | 'reversed'
  payout_id: string | null
  created_at: string
}

export interface AffiliatePayout {
  id: string
  affiliate_id: string
  amount_cents: number
  stripe_transfer_id: string | null
  status: 'pending' | 'paid' | 'failed'
  created_at: string
}

export interface Wishlist {
  user_id: string
  preset_id: string
  created_at: string
  presets?: Preset
}

export type PresetCategory =
  | 'portrait'
  | 'landscape'
  | 'street'
  | 'film'
  | 'moody'
  | 'bright'

export const CATEGORIES: { value: PresetCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'street', label: 'Street' },
  { value: 'film', label: 'Film' },
  { value: 'moody', label: 'Moody' },
  { value: 'bright', label: 'Bright' },
]
