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

---

## Next up (high impact)

### 1. Follow sellers + new-release emails
Users follow a seller; get an email when they publish.
- `follows` table (follower_id, seller_id). Reuse `lib/email.ts` (Resend).
- Trigger on publish in `publishPreset` / `updatePreset`.

### 2. Curated collections / staff picks
Editorial pages ("Best Moody Film Presets") — strong SEO + authority.
- `collections` + `collection_presets` tables, simple `/collections/[slug]` route.

---

## Trust & marketplace health

### 3. Verified / top-seller badges
Badge for sellers with 50+ sales & 4.5★+. Surfaced on cards and seller pages.

### 4. License clarity (personal vs commercial)
Per-listing license type; optional higher-priced commercial tier.

---

## Bigger swings

### 5. Style quiz / preset finder
5-question interactive flow → recommended presets. Shareable, high conversion.

### 6. "Shot with this preset" gallery
Buyers upload edited photos to the product page. Social proof.

### 7. Subscription access pass
£X/month for a rotating library (Envato Elements model). Predictable MRR.

### 8. Try before you buy
Apply a preset to a user-uploaded photo server-side. Major differentiator.

### 9. LUTs / video presets
Expand into Premiere / DaVinci LUTs — same audience, doubles catalog.

---

## Known follow-ups / debt
- **Bundle editor** — bundles can be created, published/unpublished and deleted, but
  their contents can't be edited after creation (Edit is hidden for bundles in
  `PresetActions`). Build an editor reusing `BundleCreator` for in-place changes.
- Affiliate **payouts** are tracked but not yet paid out (Stripe Connect transfers).
- Pending DB migrations must be applied to live Supabase (see repo migrations).
