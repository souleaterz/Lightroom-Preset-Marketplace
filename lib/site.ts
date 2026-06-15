/** Central site config used by metadata, sitemap, robots and structured data. */
export const siteConfig = {
  name: 'PresetScout',
  // Set NEXT_PUBLIC_SITE_URL in production (e.g. https://presetscout.com).
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://presetscout.com').replace(/\/$/, ''),
  description:
    'Discover and sell hand-crafted Lightroom presets. Preview every look on real photos with an interactive before/after slider, buy once, and own it forever.',
  tagline: 'A curated marketplace for Lightroom presets',
  twitter: '@presetscout',
  keywords: [
    'lightroom presets',
    'lightroom presets marketplace',
    'buy lightroom presets',
    'sell lightroom presets',
    'free lightroom presets',
    'photo editing presets',
    'xmp presets',
    'dng presets',
    'mobile lightroom presets',
    'lightroom mobile presets',
  ],
}

export type SiteConfig = typeof siteConfig
