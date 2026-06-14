import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PresetMarket — Lightroom Presets Marketplace',
    template: '%s | PresetMarket',
  },
  description:
    'Buy and sell professional Lightroom presets. Transform your photos in one click.',
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
