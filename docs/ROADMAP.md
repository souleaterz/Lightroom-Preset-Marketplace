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

---

## Next up (high impact)

### 1. Preset bundles / packs
Group multiple presets into a discounted pack. Raises average order value.
- New `bundles` table (or reuse `presets` with a `bundle_preset_ids uuid[]`).
- Checkout grants download access to all included presets.

### 2. Discount / promo codes
Seller-defined codes (e.g. 20% off). Sellers promote their own codes → free traffic.
- `discount_codes` table (seller_id, code, percent_off, expires_at, max_uses).
- Apply in `/api/checkout` via Stripe `discounts`.

### 3. Follow sellers + new-release emails
Users follow a seller; get an email when they publish.
- `follows` table (follower_id, seller_id). Reuse `lib/email.ts` (Resend).
- Trigger on publish in `publishPreset` / `updatePreset`.

### 4. Curated collections / staff picks
Editorial pages ("Best Moody Film Presets") — strong SEO + authority.
- `collections` + `collection_presets` tables, simple `/collections/[slug]` route.

---

## Trust & marketplace health

### 5. Verified / top-seller badges
Badge for sellers with 50+ sales & 4.5★+. Surfaced on cards and seller pages.

### 6. License clarity (personal vs commercial)
Per-listing license type; optional higher-priced commercial tier.

---

## Bigger swings

### 7. Style quiz / preset finder
5-question interactive flow → recommended presets. Shareable, high conversion.

### 8. "Shot with this preset" gallery
Buyers upload edited photos to the product page. Social proof.

### 9. Subscription access pass
£X/month for a rotating library (Envato Elements model). Predictable MRR.

### 10. Try before you buy
Apply a preset to a user-uploaded photo server-side. Major differentiator.

### 11. LUTs / video presets
Expand into Premiere / DaVinci LUTs — same audience, doubles catalog.

---

## Known follow-ups / debt
- Affiliate **payouts** are tracked but not yet paid out (Stripe Connect transfers).
- Pending DB migrations must be applied to live Supabase (see repo migrations,
  now including `0004_free_presets.sql`).
