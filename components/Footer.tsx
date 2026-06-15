'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass } from 'lucide-react'

const LINKS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: 'Marketplace',
    items: [
      { label: 'Browse Presets', href: '/browse' },
      { label: 'Become a Seller', href: '/sell' },
    ],
  },
  {
    heading: 'Program',
    items: [
      { label: 'Affiliates', href: '/affiliates' },
      { label: 'Blog', href: '/blog' },
    ],
  },
]

export function Footer() {
  const pathname = usePathname()
  // The auth screens are full-height centered layouts with no navbar; skip there.
  if (pathname?.startsWith('/auth')) return null

  return (
    <footer className="border-t border-line mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
                <Compass className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-foreground">
                Preset<span className="text-[#7c5cfc]">Scout</span>
              </span>
            </Link>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              A curated marketplace for Lightroom presets. Preview before you buy, own it forever.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {LINKS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  {col.heading}
                </h3>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">© {new Date().getFullYear()} PresetScout. All rights reserved.</p>
          <p className="text-xs text-muted">Made for photographers, by photographers.</p>
        </div>
      </div>
    </footer>
  )
}
