export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, Download, Shield, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { HeroShowcase } from '@/components/HeroShowcase'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

const HERO_PHOTO = 'https://picsum.photos/seed/presetscout-hero-9/1000/1250'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden px-4 pt-14 lg:pt-20 pb-24">
        {/* Animated background */}
        <div className="hero-aurora" aria-hidden="true">
          <div className="blob" style={{ width: 560, height: 560, top: '-5%', left: '5%', background: 'radial-gradient(circle, rgba(124,92,252,0.5), transparent 60%)', animation: 'float-a 20s ease-in-out infinite' }} />
          <div className="blob" style={{ width: 520, height: 520, top: '10%', right: '-2%', background: 'radial-gradient(circle, rgba(224,92,122,0.42), transparent 60%)', animation: 'float-b 24s ease-in-out infinite' }} />
          <div className="blob" style={{ width: 460, height: 460, bottom: '-18%', left: '35%', background: 'radial-gradient(circle, rgba(70,110,255,0.36), transparent 60%)', animation: 'float-c 28s ease-in-out infinite' }} />
        </div>
        <div className="hero-grid" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 text-sm text-[#cbb9ff] mb-7 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>A curated marketplace for Lightroom presets</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5.25rem] leading-[1.02] text-[#f0f0f0] mb-6">
              Your photos,{' '}
              <span className="gradient-text">transformed.</span>
            </h1>

            <p className="text-lg text-[#9a9aa3] max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
              Discover hand-crafted presets from independent creators. Drag to preview the exact
              look on real photos, buy once with a tap, and it&apos;s yours forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link href="/browse">
                <Button size="lg" className="text-base px-8 h-14">
                  Explore Presets
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="text-base px-8 h-14">
                  Become a Seller
                </Button>
              </Link>
            </div>

            {/* Trust row — no fabricated numbers */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-[#888891]">
              {[
                { icon: Eye, label: 'Preview before you buy' },
                { icon: Download, label: 'Instant download' },
                { icon: Shield, label: 'Secure checkout' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#7c5cfc]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: interactive before/after showcase */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroShowcase src={HERO_PHOTO} />
            <p className="mt-4 text-center text-sm text-[#888891]">
              <span className="text-[#cbb9ff]">Drag the slider</span> — every preset previews exactly like this.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
