# PresetScout — Growth Roadmap

Living doc for "make this THE destination for Lightroom presets." Items are
ordered roughly by impact-to-effort. Shipped items move to the bottom.

## ✅ Shipped

- **Free presets tier** — sellers can list at £0; buyers claim without Stripe via
  `/api/claim`. "Free only" browse filter + `/browse?free=1` sitemap landing page.
- **DNG support (Lightroom Mobile)** — `.dng` accepted in upload, surfaced in copy
  and compatibility, added to SEO keywords.
- **Structured data** — `Product` + `Offer` + `AggregateRating` + `Review` JSON-LD
  on preset pages for Google rich results; sitemap already covers presets/blog.
- **Preset bundles / packs** — a bundle is a `presets` row with `bundle_preset_ids`
  (migration `0005_bundles.sql`, file fields now nullable). Created at
  `/dashboard/bundles/new`; reuses checkout; download serves each member file via
  `/api/download/[purchaseId]?preset=<id>`. Shows savings vs buying individually.
- **Discount / promo codes** — `discount_codes` table (migration `0006`), seller-wide
  percentage codes managed at `/dashboard/codes`. Buyers apply at checkout via the
  Buy panel; validated + priced server-side in `/api/checkout` (seller absorbs the
  discount, fee taken on amount paid); usage recorded atomically in the webhook via
  `redeem_discount_code`. Shared logic in `lib/discounts.ts`.
- **Follow sellers + new-release emails** — `follows` table (migration `0007`,
  public follow graph) + `presets.new_release_notified` guard. Follow button on
  seller pages (`components/FollowButton.tsx`); publishing a preset blasts followers
  once via `notifyFollowersOfNewRelease` in the publish actions + `sendNewReleaseEmail`
  (Resend). *Follow-up:* publishing via the dashboard eye-toggle (`PresetActions`)
  doesn't email — only the upload wizard's publish/update does.

---

- **Multi-currency display** — prices shown in the visitor's currency (auto by Vercel
  geo + manual nav switcher, remembered in a `currency` cookie). Display-only: charge
  stays GBP with a "billed in GBP" note. `lib/currency.ts` (rates via open.er-api.com,
  6h cache + static fallback), `CurrencyProvider` / `Price` / `CurrencySwitcher`.
  Dashboards/payouts/earnings stay GBP (real settled money). *Future:* true local
  charging = enable Stripe Adaptive Pricing (dashboard toggle) + small checkout tweak.
- **Verified / top-seller badges** — `profiles.is_verified` (migration `0008`, manual
  admin flag) drives a blue Verified badge; "Top Seller" is automatic at
  `TOP_SELLER_MIN_SALES` (50) sales. `components/SellerBadge.tsx` +
  `getSellerBadge()`; shown on cards, seller pages, and preset author sections.
  *Follow-up:* Top Seller is sales-only — could add a 4.5★ requirement once seller
  rating is denormalized; and `is_verified` has no admin UI yet (set via SQL).

---

## Next up (high impact)

### 1. Curated collections / staff picks
Editorial pages ("Best Moody Film Presets") — strong SEO + authority.
- `collections` + `collection_presets` tables, simple `/collections/[slug]` route.

---

## Trust & marketplace health

### 2. License clarity (personal vs commercial)
Per-listing license type; optional higher-priced commercial tier.

---

## SEO & discoverability

Full checklist + status in [`docs/SEO.md`](./SEO.md). Highest-leverage items:

### Quick wins (do first)
- 🔧 **Fix canonical URLs** — root layout's global `canonical: '/'` is inherited by
  child pages; set per-page canonicals so pages aren't all canonicalising to home.
- ⬜ **Open Graph images** — default `opengraph-image` + dynamic per-preset OG image
  (after photo via `ImageResponse`); add `og:image` to preset metadata. Drives social CTR.
- ⬜ **Blog post metadata** — `app/blog/[slug]` lacks `generateMetadata` (no unique
  title/description/canonical/OG per post).
- ⬜ **Search Console + Bing** — verify domain, submit sitemap, monitor coverage.
- ⬜ **Organization + BreadcrumbList JSON-LD**.

### Content & structure (ranking driver)
- ⬜ **Category landing pages** with real URLs (`/presets/portrait`, …) + unique copy,
  instead of `?category=` query params.
- ⬜ **Free-presets content hub** (`/free-lightroom-presets`) — high search volume.
- ⬜ **Keyword-rich preset slugs** (`/preset/[id]/[slug]`) with 301s from old URLs.
- ⬜ **Blog content calendar** ("best presets for X", install guides incl. DNG/mobile)
  internally linking to presets/categories.

### Performance
- 🔧 Audit `next/image` `unoptimized` usage + Core Web Vitals (LCP/CLS); confirm the
  dynamic (cookie/geo) render isn't hurting TTFB.

## Bigger swings

### 3. Style quiz / preset finder
5-question interactive flow → recommended presets. Shareable, high conversion.

### 4. "Shot with this preset" gallery
Buyers upload edited photos to the product page. Social proof.

### 5. Subscription access pass
£X/month for a rotating library (Envato Elements model). Predictable MRR.

### 6. Try before you buy
Apply a preset to a user-uploaded photo server-side. Major differentiator.

### 7. LUTs / video presets
Expand into Premiere / DaVinci LUTs — same audience, doubles catalog.

---

## Known follow-ups / debt
- **Bundle editor** — bundles can be created, published/unpublished and deleted, but
  their contents can't be edited after creation (Edit is hidden for bundles in
  `PresetActions`). Build an editor reusing `BundleCreator` for in-place changes.
- Pending DB migrations must be applied to live Supabase (see repo migrations).

## ✅ Shipped (continued)
- **Affiliate payouts** — commission ledger (`affiliate_commissions`) + `affiliate_payouts`
  (migration `0009`). Webhook records a commission (half the fee) per referred sale and
  reverses it on dispute. Self-service cash-out via `/api/affiliate/payout` (Stripe
  transfer to the affiliate's connected account), 30-day clearing hold, £25 minimum.
  Balance/hold/history UI on `/affiliate`. Helpers in `lib/affiliate.ts`.
