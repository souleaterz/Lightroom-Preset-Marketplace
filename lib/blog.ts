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
        text: 'On PresetScout you keep **90% of every sale**, get paid directly through Stripe, and pay **zero fees for your first month**. List for free and start selling the same day.',
      },
      {
        type: 'quote',
        text: 'Your editing style is worth paying for. Package it once, preview it honestly, and let it sell while you shoot.',
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
