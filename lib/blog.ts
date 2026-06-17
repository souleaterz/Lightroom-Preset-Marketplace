/**
 * File-based blog content. Posts live here as structured blocks so they render
 * as clean semantic HTML (good for SEO) with no extra markdown dependencies.
 * Add a new object to POSTS to publish a new article.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string }

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string // ISO date
  author: string
  readingMinutes: number
  tags: string[]
  coverImage: string
  body: Block[]
}

export const POSTS: BlogPost[] = [
  {
    slug: 'how-to-install-lightroom-presets',
    title: 'How to Install Lightroom Presets (Desktop & Mobile)',
    description:
      'A step-by-step guide to installing Lightroom presets on desktop and mobile — XMP, .lrtemplate and DNG files explained.',
    date: '2026-05-12',
    author: 'PresetScout Team',
    readingMinutes: 5,
    tags: ['Guides', 'Lightroom', 'Beginners'],
    coverImage: 'https://picsum.photos/seed/blog-install-presets/1200/630',
    body: [
      {
        type: 'p',
        text: 'Bought a pack of presets and not sure what to do next? Installing Lightroom presets takes about two minutes once you know where everything goes. This guide covers **Lightroom Classic**, **Lightroom CC (desktop)**, and the **free Lightroom mobile app**.',
      },
      { type: 'h2', text: 'Know your file types' },
      {
        type: 'p',
        text: 'Modern presets ship as **.xmp** files. Older packs may include **.lrtemplate** files, and mobile-first packs sometimes use **DNG** photos that carry the edit. PresetScout downloads include the right format for your app, plus a short readme.',
      },
      { type: 'h2', text: 'Lightroom Classic (desktop)' },
      {
        type: 'ul',
        items: [
          'Open Lightroom Classic and switch to the Develop module.',
          'In the Presets panel on the left, click the + icon and choose “Import Presets”.',
          'Select the .xmp (or .zip) file you downloaded and click Import.',
          'Your new preset appears under “User Presets” — click any photo to apply it.',
        ],
      },
      { type: 'h2', text: 'Lightroom CC (desktop & web)' },
      {
        type: 'ul',
        items: [
          'Open the Edit panel and click the Presets button at the bottom.',
          'Click the three-dot menu and choose “Import Presets”.',
          'Select your downloaded file — presets sync automatically across your devices.',
        ],
      },
      { type: 'h2', text: 'Lightroom mobile (free app)' },
      {
        type: 'p',
        text: 'If your pack includes DNG files, import them into the app, open one, tap the “…” menu and choose “Create Preset”. For .xmp packs, use the Presets menu and tap “Import Presets”. Either way the look is then one tap away on any photo.',
      },
      { type: 'h2', text: 'Troubleshooting' },
      {
        type: 'ul',
        items: [
          'Preset looks too strong? Lower the effect by adjusting exposure and the individual sliders — presets are a starting point, not a final answer.',
          'Colours look off? Presets respond to the original photo’s lighting. Tweak white balance for a perfect match.',
          'Can’t find the import option? Make sure your Lightroom app is updated to the latest version.',
        ],
      },
      {
        type: 'quote',
        text: 'Every preset on PresetScout ships with a live before/after slider, so you always know exactly what you’re getting before you buy.',
      },
    ],
  },
  {
    slug: 'best-lightroom-presets-for-portraits',
    title: 'The Best Lightroom Presets for Portrait Photography in 2026',
    description:
      'What makes a great portrait preset, the looks worth owning, and how to choose presets that flatter real skin tones.',
    date: '2026-05-28',
    author: 'PresetScout Team',
    readingMinutes: 6,
    tags: ['Inspiration', 'Portraits', 'Buying Guide'],
    coverImage: 'https://picsum.photos/seed/blog-portrait-presets/1200/630',
    body: [
      {
        type: 'p',
        text: 'Great portrait presets do one thing brilliantly: they make skin look natural while giving the whole frame a consistent mood. Here’s how to choose presets that flatter your subjects instead of fighting them.',
      },
      { type: 'h2', text: 'What separates a good portrait preset' },
      {
        type: 'ul',
        items: [
          'Skin tones stay believable — no orange casts or muddy shadows.',
          'Contrast is gentle so faces keep detail in the highlights.',
          'Colour grading is cohesive but easy to dial back per photo.',
        ],
      },
      { type: 'h2', text: 'Popular portrait looks worth owning' },
      { type: 'h3', text: 'Warm & natural' },
      {
        type: 'p',
        text: 'The everyday workhorse — slightly warm, soft contrast, true-to-life skin. Perfect for family sessions and lifestyle shoots.',
      },
      { type: 'h3', text: 'Light & airy' },
      {
        type: 'p',
        text: 'Bright, low-contrast and clean, with lifted shadows. A favourite for weddings, newborns and bright outdoor portraits.',
      },
      { type: 'h3', text: 'Moody film' },
      {
        type: 'p',
        text: 'Deeper shadows, muted colour and a hint of grain for a cinematic, editorial feel.',
      },
      { type: 'h2', text: 'How to choose before you buy' },
      {
        type: 'p',
        text: 'Always preview a preset on a photo similar to your own — lighting changes everything. On PresetScout you can drag the before/after slider on real photos for every listing, so there are no surprises after checkout.',
      },
      {
        type: 'quote',
        text: 'Buy the look you can actually see working. Preview first, then buy once and own it forever.',
      },
    ],
  },
  {
    slug: 'how-to-sell-lightroom-presets',
    title: 'How to Sell Lightroom Presets and Make Money in 2026',
    description:
      'Turn your editing style into income: how to package, price and sell Lightroom presets — and keep 90% of every sale.',
    date: '2026-06-09',
    author: 'PresetScout Team',
    readingMinutes: 7,
    tags: ['Sellers', 'Business', 'Guides'],
    coverImage: 'https://picsum.photos/seed/blog-sell-presets/1200/630',
    body: [
      {
        type: 'p',
        text: 'If people keep asking how you edit your photos, you already have a product. Selling Lightroom presets is one of the simplest ways for photographers to earn passive income — you create the look once and sell it again and again.',
      },
      { type: 'h2', text: 'Step 1 — Build a small, focused pack' },
      {
        type: 'p',
        text: 'Don’t overwhelm buyers with 50 presets. A tight pack of 5–10 cohesive looks that work across different lighting sells far better than a giant grab-bag.',
      },
      { type: 'h2', text: 'Step 2 — Show, don’t tell' },
      {
        type: 'ul',
        items: [
          'Use real before/after photos — buyers want proof, not promises.',
          'Show the look on a few different scenes and skin tones.',
          'Write a short, honest description of the mood each preset creates.',
        ],
      },
      { type: 'h2', text: 'Step 3 — Price with confidence' },
      {
        type: 'p',
        text: 'Most individual presets sell between £4 and £15, and curated packs go higher. Start in that range, watch what converts, and adjust. You set your own prices on PresetScout.',
      },
      { type: 'h2', text: 'Step 4 — Keep more of what you earn' },
      {
        type: 'p',
        text: 'On PresetScout you keep **90% of every sale** with **one flat 10% fee** — no listing fees or hidden costs — and get paid directly through Stripe. List for free and start selling the same day.',
      },
      {
        type: 'quote',
        text: 'Your editing style is worth paying for. Package it once, preview it honestly, and let it sell while you shoot.',
      },
    ],
  },
  {
    slug: 'how-to-create-lightroom-presets',
    title: 'How to Create Your Own Lightroom Presets (and Sell Them)',
    description:
      'Learn how to create Lightroom presets from your own edits on desktop or mobile — then turn that signature look into a product you can sell.',
    date: '2026-06-14',
    author: 'PresetScout Team',
    readingMinutes: 7,
    tags: ['Sellers', 'Guides', 'Lightroom'],
    coverImage: 'https://picsum.photos/seed/blog-create-presets/1200/630',
    body: [
      {
        type: 'p',
        text: 'If friends keep asking how you edit your photos, you already have the makings of a product. Creating your own Lightroom presets is easier than most people think — you perfect one look, save it, and it becomes a one-tap style you can reuse forever (and sell again and again). Here is the full process, on desktop and mobile.',
      },
      { type: 'h2', text: 'What a Lightroom preset actually is' },
      {
        type: 'p',
        text: 'A preset is simply a saved set of Develop adjustments — white balance, tone, colour, grain and more — bundled into a single click. Instead of editing every photo from scratch, you apply your look instantly and fine-tune from there. That reusable consistency is exactly what buyers pay for.',
      },
      { type: 'h2', text: 'Step 1 — Perfect one edit you love' },
      {
        type: 'p',
        text: 'Start with a photo that represents the kind of work you shoot, and edit it until it feels unmistakably “you”. Focus on the adjustments that define a look rather than fixes specific to one image:',
      },
      {
        type: 'ul',
        items: [
          '**White balance & tone** — set the overall warmth and exposure mood.',
          '**Tone curve & contrast** — the backbone of any look; gentle curves read as “film-like”.',
          '**HSL / colour mixer** — tune skin tones and signature colours (muted greens, teal shadows, etc.).',
          '**Colour grading** — add a tint to shadows/highlights for a cohesive feel.',
          '**Grain & texture** — a touch of grain makes digital files feel organic.',
        ],
      },
      {
        type: 'p',
        text: 'Avoid baking in photo-specific fixes like spot removal or heavy cropping — those won’t translate to other images.',
      },
      { type: 'h2', text: 'Step 2 — Save it as a preset' },
      { type: 'h3', text: 'Lightroom Classic & CC (desktop)' },
      {
        type: 'ul',
        items: [
          'In the Develop module, open the Presets panel and click the **+** icon.',
          'Choose **Create Preset**, name it, and tick the settings to include (leave out exposure if you want it to adapt per photo).',
          'Save — it now lives under your User Presets, ready to apply or export.',
        ],
      },
      { type: 'h3', text: 'Lightroom mobile (free app)' },
      {
        type: 'p',
        text: 'On mobile, open an edited photo, tap the **…** menu and choose **Create Preset**. Mobile-first packs are often delivered as **DNG** files too — the same look, baked into a sample photo. New to this? Our guide on [how to install Lightroom presets](/blog/how-to-install-lightroom-presets) covers every format your buyers will use.',
      },
      { type: 'h2', text: 'Step 3 — Test it across many photos' },
      {
        type: 'p',
        text: 'A preset that looks incredible on one photo but breaks on the next won’t sell. Apply yours to a range of scenes and lighting before you trust it:',
      },
      {
        type: 'ul',
        items: [
          'Bright and dark scenes — does it hold up in both?',
          'Different skin tones — do faces stay natural?',
          'Indoor vs golden hour — is the white balance forgiving?',
        ],
      },
      {
        type: 'p',
        text: 'Adjust until it behaves well with only minor per-photo tweaks. That robustness is what earns 5-star reviews.',
      },
      { type: 'h2', text: 'Step 4 — Build a small, cohesive pack' },
      {
        type: 'p',
        text: 'Don’t dump 50 random presets on people. A tight pack of **5–10 cohesive looks** that work together sells far better than a giant grab-bag. Give the pack a clear theme — moody film, light & airy, warm portraits — so buyers instantly know who it’s for.',
      },
      { type: 'h2', text: 'Step 5 — Turn your presets into income' },
      {
        type: 'p',
        text: 'Once your pack is ready, you can list it in minutes. On PresetScout you keep **90% of every sale** — one flat 10% fee with no listing or hidden costs — and get paid directly through Stripe. [Start selling on PresetScout](/sell), then [upload your first preset](/dashboard/presets/new) with real before/after previews so buyers see exactly what they’re getting.',
      },
      {
        type: 'p',
        text: 'Tip: list one preset for **free** to build an audience — free presets pull in new buyers who often come back for your paid packs.',
      },
      {
        type: 'quote',
        text: 'You only have to create the look once. Do it well, package it honestly, and it can sell while you’re out shooting.',
      },
    ],
  },
  {
    slug: 'how-much-money-selling-lightroom-presets',
    title: 'How Much Money Can You Make Selling Lightroom Presets?',
    description:
      'A realistic look at earnings from selling Lightroom presets — pricing, volume, what top sellers do differently, and how much of each sale you actually keep.',
    date: '2026-06-15',
    author: 'PresetScout Team',
    readingMinutes: 6,
    tags: ['Sellers', 'Business', 'Buying Guide'],
    coverImage: 'https://picsum.photos/seed/blog-preset-income/1200/630',
    body: [
      {
        type: 'p',
        text: 'It’s the first thing every photographer wonders before they start: can you actually make money selling Lightroom presets? The honest answer is yes — but how much depends entirely on a few things you control. Let’s break down the real numbers.',
      },
      { type: 'h2', text: 'The honest answer: it depends' },
      {
        type: 'p',
        text: 'Preset income ranges from a little pocket money to a meaningful side business. The difference isn’t luck — it’s pricing, how many people see your work, and whether your previews actually convince buyers. The maths is simple once you see it.',
      },
      { type: 'h2', text: 'The simple maths: price × volume' },
      {
        type: 'p',
        text: 'Most individual presets sell for **£4–£15**, and curated packs go higher. Your monthly income is just price multiplied by sales. A few examples:',
      },
      {
        type: 'ul',
        items: [
          'A £9 pack selling **20 times a month** = £180/month.',
          'The same pack at **100 sales** = £900/month.',
          'Three packs each doing 40 sales at £12 = **£1,440/month**.',
        ],
      },
      {
        type: 'p',
        text: 'Because a preset is made once and sold infinitely, every extra sale is almost pure margin. The work is front-loaded; the income compounds.',
      },
      { type: 'h2', text: 'What you actually keep (fees matter a lot)' },
      {
        type: 'p',
        text: 'Headline price isn’t take-home. Many platforms take 30–50% or pile on listing and ad fees. On [PresetScout](/sell) you keep **90% of every sale** — one flat 10% fee with no hidden costs — and receive payouts straight to your bank via Stripe. On £900 of sales that 90% vs, say, 60% split is the difference between £810 and £540 in your pocket.',
      },
      { type: 'h2', text: 'What separates the earners from the rest' },
      {
        type: 'ul',
        items: [
          '**Honest previews** — real before/after photos convert far better than promises.',
          '**A clear niche** — “moody wedding presets” outsells “my presets”.',
          '**Consistency** — sellers who release regularly build a following.',
          '**Promotion** — sharing your link drives the first sales that build momentum.',
        ],
      },
      { type: 'h2', text: 'Add a second income stream' },
      {
        type: 'p',
        text: 'You can also earn by bringing other creators on board. Our [affiliate program](/affiliates) pays you a share of every sale from photographers you refer — passive income on top of your own packs.',
      },
      { type: 'h2', text: 'Start today' },
      {
        type: 'p',
        text: 'Demand is real across styles — see how many buyers browse [wedding presets](/presets/wedding) and [portrait presets](/presets/portrait). The fastest way to learn what sells is to list one pack and watch. [Become a seller](/sell) and publish your first preset for free.',
      },
      {
        type: 'quote',
        text: 'You won’t get rich overnight, but a good pack with honest previews can earn quietly for years. The only way to find your number is to start.',
      },
    ],
  },
  {
    slug: 'where-to-sell-lightroom-presets',
    title: 'Where to Sell Lightroom Presets: Best Platforms in 2026',
    description:
      'Comparing the best places to sell Lightroom presets in 2026 — fees, payouts, previews and ease of use — so you keep more of what you earn.',
    date: '2026-06-16',
    author: 'PresetScout Team',
    readingMinutes: 6,
    tags: ['Sellers', 'Business', 'Guides'],
    coverImage: 'https://picsum.photos/seed/blog-where-to-sell/1200/630',
    body: [
      {
        type: 'p',
        text: 'You’ve made a pack of presets you’re proud of — so where should you actually sell them? The platform you choose decides how much you keep, how fast you get paid, and how easily buyers find you. Here’s an honest comparison for 2026.',
      },
      { type: 'h2', text: 'What to look for in a platform' },
      {
        type: 'ul',
        items: [
          '**Payout split** — how much of each sale you keep after fees.',
          '**Payout speed** — do you get paid instantly, or wait weeks?',
          '**Previews** — can buyers see the look on real photos before paying?',
          '**Discoverability** — does the platform bring you buyers, or must you bring your own?',
          '**Ease of setup** — can you list in minutes, or is it a project?',
        ],
      },
      { type: 'h2', text: 'Your options, honestly' },
      { type: 'h3', text: 'Your own website / general digital-download tools' },
      {
        type: 'p',
        text: 'Maximum control and you keep the most per sale — but you bring 100% of the traffic, handle delivery and support yourself, and pay for the storefront. Great once you have an audience; slow going from a standing start.',
      },
      { type: 'h3', text: 'Big general marketplaces' },
      {
        type: 'p',
        text: 'Huge built-in audiences, but presets sit next to millions of unrelated products, fees are often steep, and you have little control over how your work is presented. Easy to get lost in the noise.',
      },
      { type: 'h3', text: 'PresetScout — built specifically for presets' },
      {
        type: 'p',
        text: 'A focused marketplace where every listing has a live before/after slider, buyers are there specifically for Lightroom presets, and you keep **90% of every sale** with **one flat 10% fee** (no listing or ad fees) and instant Stripe payouts. You can [browse the marketplace](/browse) to see how listings look, then [start selling](/sell) in minutes.',
      },
      { type: 'h2', text: 'A quick fee reality check' },
      {
        type: 'ul',
        items: [
          'Keep **90%** on PresetScout vs the 50–70% common elsewhere.',
          '**One flat 10%** fee — no listing fees, ad surcharges or monthly costs.',
          'Instant payouts via Stripe, straight to your bank.',
        ],
      },
      { type: 'h2', text: 'Why previews win sales' },
      {
        type: 'p',
        text: 'Presets are a visual product, so buyers want proof, not promises. Listings with genuine before/after previews convert dramatically better than a single sample image — which is exactly why PresetScout makes the slider the centre of every listing.',
      },
      { type: 'h2', text: 'Start in minutes' },
      {
        type: 'p',
        text: 'Pick the platform that lets you keep the most and get found the fastest. [Become a seller](/sell), [upload your first preset](/dashboard/presets/new), and you can be live today. Want passive income too? Refer other creators through the [affiliate program](/affiliates).',
      },
      {
        type: 'quote',
        text: 'The best place to sell presets is wherever you keep the most of each sale and buyers can see your work in action — then promote relentlessly.',
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}
