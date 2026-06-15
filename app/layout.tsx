import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PresetScout — Lightroom Presets Marketplace',
    template: '%s | PresetScout',
  },
  description:
    'Discover hand-crafted Lightroom presets from independent creators. Preview, buy once, and transform your photos in one click.',
  keywords: ['lightroom presets', 'photo editing', 'presets marketplace', 'xmp presets'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0b] text-[#f0f0f0] antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
