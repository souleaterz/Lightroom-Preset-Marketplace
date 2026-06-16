# PresetScout — SEO Checklist & Playbook

How to get found and rank for "lightroom presets", "free lightroom presets",
"\<style\> presets", etc. Legend: ✅ done · ⬜ to do · 🔧 verify/fix.

---

## 0. Do these first (highest impact / lowest effort)

1. 🔧 **Fix canonical URLs.** Root layout sets `alternates: { canonical: '/' }`,
   which Next inherits into child pages — so preset/browse/seller pages may all be
   canonicalising to the homepage (tells Google they're duplicates). Fix: remove the
   global canonical and set a per-page canonical in each `generateMetadata`
   (homepage `/`, preset `/preset/[id]`, seller `/seller/[username]`, etc.).
2. ⬜ **Open Graph / social share images.** No OG image today → links shared on
   X/FB/WhatsApp/Discord show no preview = far fewer clicks. Add a default
   `app/opengraph-image.tsx` and a **dynamic per-preset OG image** (the after photo)
   via `ImageResponse`.
3. ⬜ **Blog post metadata.** `app/blog/[slug]/page.tsx` has no `generateMetadata`,
   so posts lack unique titles/descriptions/canonicals/OG. Add it.
4. ⬜ **Google Search Console + Bing Webmaster.** Verify the domain, submit
   `https://presetscout.com/sitemap.xml`, watch Coverage + Performance. (Bing also
   feeds ChatGPT search.)
5. ⬜ **Per-preset `og:image`.** In the preset `generateMetadata`, set
   `openGraph.images` / `twitter.images` to the preset's after image.

---

## 1. Technical foundation

- ✅ Server-rendered (Next.js App Router) — crawlable HTML, fast.
- ✅ `sitemap.ts` — home, browse, free-presets landing, sell, affiliates, blog +
  posts, and all published presets (up to 5000).
- ✅ `robots.ts` — allows crawl, disallows private routes, references sitemap.
- ✅ Root metadata: title template, description, keywords, OpenGraph, Twitter card,
  `robots` index/follow, `metadataBase`.
- ✅ `WebSite` JSON-LD with `SearchAction` (sitelinks search box eligibility).
- ✅ `Product` + `Offer` + `AggregateRating` + `Review` JSON-LD on preset pages
  (price/stars rich results).
- ✅ Favicon (`app/icon.svg`).
- 🔧 Canonicals (see §0.1).
- ⬜ `Organization` JSON-LD (brand entity / knowledge panel) — name, logo, sameAs
  (social profiles).
- ⬜ `BreadcrumbList` JSON-LD on preset/seller/category pages (breadcrumb rich result).
- ⬜ Web manifest + apple-touch-icon (minor; PWA/share polish).
- ⬜ Add seller pages (and future collection/category pages) to the sitemap.

---

## 2. Content & keywords (the real ranking driver)

- ⬜ **Category landing pages** with unique copy + indexable URLs, e.g.
  `/presets/portrait`, `/presets/film`, `/presets/moody` (not just `?category=`
  query params, which rank poorly). Target "portrait lightroom presets" etc.
- ⬜ **Free presets hub** — a content-rich `/free-lightroom-presets` page (huge search
  volume) beyond the current `/browse?free=1` filter.
- ⬜ **Blog content calendar** targeting informational keywords that funnel to presets:
  "best lightroom presets for \<X\>", "how to install lightroom presets (desktop +
  mobile/DNG)", "what is a lightroom preset", style round-ups. Internally link to
  relevant presets/categories.
- ⬜ **Collections / staff picks** (already on the roadmap) double as keyword landing
  pages ("best moody film presets").
- ⬜ Ensure each preset listing has a real description (thin/empty descriptions hurt).

---

## 3. On-page

- ⬜ **Keyword-rich preset URLs (slugs).** `/preset/[uuid]` → `/preset/[uuid]/[slug]`
  or slug-based, e.g. `/preset/moody-golden-hour`. Keep old URLs 301-redirecting.
- ✅ Descriptive `alt` text on card before/after images.
- ⬜ One clear `<h1>` per page + logical heading hierarchy (audit browse/landing pages).
- ⬜ Internal linking: tags, categories, "related presets" (✅ related exists), seller
  cross-links, blog→preset links.
- ⬜ Set canonical on filtered `/browse?...` views to the clean `/browse` to avoid
  duplicate-content dilution from query params.

---

## 4. Performance / Core Web Vitals

- 🔧 Reading the currency cookie/geo header in the root layout makes pages render
  per-request (dynamic). Confirm TTFB is fine; consider moving currency detection
  client-side if it hurts, or rely on CDN caching.
- 🔧 Audit `next/image` usage — some images use `unoptimized`; prefer optimized,
  correctly-sized images with width/height to protect LCP/CLS.
- ⬜ Run PageSpeed Insights / Lighthouse on home, browse, a preset page; fix LCP/CLS.
- ⬜ Preload the hero/LCP image on the homepage.

---

## 5. Off-page / authority

- ⬜ Submit to relevant directories & preset roundups; reach out for backlinks.
- ⬜ Social profiles (link via `Organization.sameAs`); consistent NAP/brand.
- ⬜ Encourage sellers to link their PresetScout storefront from their own
  sites/socials (free, relevant backlinks).
- ⬜ Pinterest is huge for photo presets — pin before/after images linking to listings.

---

## 6. Operational / monitoring

- ⬜ Google Search Console: verify, submit sitemap, monitor Coverage + Core Web Vitals.
- ⬜ Bing Webmaster Tools: verify + submit sitemap.
- ⬜ Analytics (e.g. Vercel Analytics / Plausible / GA4) to measure organic traffic.
- ⬜ Rank tracking for target keywords; review quarterly.
- ⬜ Keep `RESEND_FROM` on a verified domain (deliverability is an indirect trust signal).
