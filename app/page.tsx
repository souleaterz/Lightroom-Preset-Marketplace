export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, Download, Shield, Zap, Camera, Compass, Sparkles, Star } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { PresetCard } from '@/components/PresetCard'
import { HeroShowcase } from '@/components/HeroShowcase'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Preset } from '@/types/database'

const HERO_PHOTO = 'https://picsum.photos/seed/presetscout-hero-9/1000/1250'

const CATEGORIES = [
  { name: 'Portrait', seed: 'ps-portrait-3', blurb: 'Warm, flattering skin tones' },
  { name: 'Landscape', seed: 'ps-landscape-7', blurb: 'Epic, vivid scenery' },
  { name: 'Street', seed: 'ps-street-5', blurb: 'Gritty, urban contrast' },
  { name: 'Film', seed: 'ps-film-2', blurb: 'Nostalgic analog grain' },
  { name: 'Moody', seed: 'ps-moody-4', blurb: 'Dark, cinematic tones' },
  { name: 'Bright', seed: 'ps-bright-8', blurb: 'Clean, airy and light' },
]

async function getLatestPresets(): Promise<Preset[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('presets')
      .select('*, profiles!presets_seller_id_fkey(id, username, display_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as Preset[]) || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const latestPresets = await getLatestPresets()
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
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="text-base px-8 h-14">
                  Become a Creator
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

      {/* ───────────────── Latest presets (only when populated) ───────────────── */}
      {latestPresets.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-semibold text-[#f0f0f0]">Latest Presets</h2>
                <p className="text-[#888891] mt-1">Fresh from our creators</p>
              </div>
              <Link href="/browse">
                <Button variant="outline" size="sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────── Browse by style ───────────────── */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-3">Browse by style</h2>
            <p className="text-[#888891]">Find the perfect look for every kind of photography</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/browse?category=${cat.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl aspect-[16/10] border border-white/[0.08]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(https://picsum.photos/seed/${cat.seed}/640/400)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/5 group-hover:ring-[#7c5cfc]/40 transition-colors rounded-2xl" />
                <div className="absolute bottom-0 left-0 p-5">
                  <div className="text-lg font-semibold text-white">{cat.name}</div>
                  <div className="text-xs text-white/70 mt-0.5">{cat.blurb}</div>
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Why PresetScout ───────────────── */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-3">Why PresetScout</h2>
            <p className="text-[#888891]">A better way to find — and sell — great presets</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'See it before you buy', desc: 'Every preset ships with a live before/after on real photos. No guesswork, no surprises.' },
              { icon: Star, title: 'Curated, not cluttered', desc: 'A focused catalog of genuinely good looks from real photographers — quality over quantity.' },
              { icon: Compass, title: 'Built for creators', desc: 'Keep 92% of every sale, set your own prices, and pay zero fees for your first month.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/[0.08] bg-[#111114] p-7 hover:border-white/[0.15] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-[#7c5cfc]" />
                </div>
                <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">{title}</h3>
                <p className="text-sm text-[#888891] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── How it works ───────────────── */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-3">How it works</h2>
            <p className="text-[#888891]">From browsing to editing in under two minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Camera, step: '01', title: 'Browse & preview', desc: 'Explore presets with interactive before/after sliders before you spend a penny.' },
              { icon: Zap, step: '02', title: 'Buy instantly', desc: 'One-tap purchase with Stripe. No subscription, no recurring fees — yours forever.' },
              { icon: Download, step: '03', title: 'Download & apply', desc: 'Grab your .xmp, .lrtemplate, or .zip and drop it into Lightroom in seconds.' },
            ].map((item) => (
              <div key={item.step} className="relative p-7 bg-[#111114] border border-white/[0.08] rounded-2xl">
                <div className="absolute top-5 right-5 font-mono text-4xl font-bold text-white/[0.05]">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-[#7c5cfc]" />
                </div>
                <h3 className="font-semibold text-[#f0f0f0] mb-2">{item.title}</h3>
                <p className="text-sm text-[#888891] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Creator CTA ───────────────── */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7c5cfc]/20 to-[#e05c7a]/10 border border-[#7c5cfc]/20 p-10 md:p-16 text-center">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#7c5cfc]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 text-xs font-medium text-[#cbb9ff] mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Founding creators: 0% fees for your first month
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#f0f0f0] mb-4">
                Turn your style into income
              </h2>
              <p className="text-[#9a9aa3] text-lg max-w-xl mx-auto mb-8">
                List your presets, set your own price, and keep 92% of every sale. Free to join —
                and your first month is completely fee-free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-base">
                    Start Selling Today
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="text-sm text-[#888891]">Free to list · 92% revenue share</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Footer ───────────────── */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
              <Compass className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#f0f0f0]">
              Preset<span className="text-[#7c5cfc]">Scout</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#888891]">
            <Link href="/browse" className="hover:text-[#f0f0f0] transition-colors">Browse</Link>
            <Link href="/auth/signup" className="hover:text-[#f0f0f0] transition-colors">Sell</Link>
          </div>
          <p className="text-xs text-[#888891]">© 2026 PresetScout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
