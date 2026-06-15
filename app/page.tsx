export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, Download, Shield, Zap, Camera, Compass, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { PresetCard } from '@/components/PresetCard'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Preset } from '@/types/database'

const CATEGORIES = [
  { name: 'Portrait', icon: '👤', color: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Landscape', icon: '🏔️', color: 'from-green-500/20 to-green-600/10' },
  { name: 'Street', icon: '🏙️', color: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Film', icon: '🎞️', color: 'from-amber-500/20 to-amber-600/10' },
  { name: 'Moody', icon: '🌑', color: 'from-slate-500/20 to-slate-600/10' },
  { name: 'Bright', icon: '☀️', color: 'from-yellow-500/20 to-yellow-600/10' },
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

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="hero-aurora" aria-hidden="true">
          <div
            className="blob"
            style={{
              width: 560, height: 560, top: '2%', left: '12%',
              background: 'radial-gradient(circle, rgba(124,92,252,0.55), transparent 60%)',
              animation: 'float-a 20s ease-in-out infinite',
            }}
          />
          <div
            className="blob"
            style={{
              width: 500, height: 500, top: '18%', right: '8%',
              background: 'radial-gradient(circle, rgba(224,92,122,0.45), transparent 60%)',
              animation: 'float-b 24s ease-in-out infinite',
            }}
          />
          <div
            className="blob"
            style={{
              width: 460, height: 460, bottom: '-12%', left: '38%',
              background: 'radial-gradient(circle, rgba(70,110,255,0.4), transparent 60%)',
              animation: 'float-c 28s ease-in-out infinite',
            }}
          />
        </div>
        <div className="hero-grid" aria-hidden="true" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 text-sm text-[#7c5cfc] mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>A curated marketplace for Lightroom presets</span>
          </div>

          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl leading-[1.05] mb-6 text-[#f0f0f0]">
            Your photos,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #e05c7a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              transformed
            </span>
            <br />
            in one click.
          </h1>

          <p className="text-lg sm:text-xl text-[#888891] max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover hand-crafted Lightroom presets from independent creators. Preview every
            look with a live before/after, buy once, and it&apos;s yours forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

          {/* Honest value props (no fabricated numbers) */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Eye, title: 'Try before you buy', desc: 'Live before/after on every preset' },
              { icon: Download, title: 'Instant delivery', desc: 'Download the moment you pay' },
              { icon: Shield, title: 'Secure checkout', desc: 'One-time payment via Stripe' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-4 text-left"
              >
                <Icon className="h-5 w-5 text-[#7c5cfc] mb-2" />
                <div className="text-sm font-medium text-[#f0f0f0]">{title}</div>
                <div className="text-xs text-[#888891] mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest presets — only when the catalog has something */}
      {latestPresets.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
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

      {/* Categories */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#f0f0f0] mb-3">Browse by Style</h2>
            <p className="text-[#888891]">Find the perfect look for every type of photography</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/browse?category=${cat.name.toLowerCase()}`}
                className={`group bg-gradient-to-br ${cat.color} border border-white/[0.06] hover:border-white/20 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="text-sm font-medium text-[#f0f0f0] group-hover:text-white transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-[#f0f0f0] mb-3">How it works</h2>
            <p className="text-[#888891]">Getting started takes less than 2 minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="h-6 w-6 text-[#7c5cfc]" />,
                step: '01',
                title: 'Browse & Preview',
                desc: 'Explore presets with interactive before/after sliders before you spend a penny.',
              },
              {
                icon: <Zap className="h-6 w-6 text-[#7c5cfc]" />,
                step: '02',
                title: 'Buy Instantly',
                desc: 'One-click purchase with Stripe. No subscription, no recurring fees. Yours forever.',
              },
              {
                icon: <Download className="h-6 w-6 text-[#7c5cfc]" />,
                step: '03',
                title: 'Download & Apply',
                desc: 'Grab your .xmp, .lrtemplate, or .zip and apply it in Lightroom instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 bg-[#111114] border border-white/[0.08] rounded-xl">
                <div className="absolute top-4 right-4 font-mono text-4xl font-bold text-white/[0.04]">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#f0f0f0] mb-2">{item.title}</h3>
                <p className="text-sm text-[#888891] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="py-20 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c5cfc]/20 to-[#e05c7a]/10 border border-[#7c5cfc]/20 p-10 md:p-14 text-center">
            <Compass className="h-10 w-10 text-[#7c5cfc] mx-auto mb-6" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 text-xs font-medium text-[#7c5cfc] mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Founding creators: 0% fees for your first month
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#f0f0f0] mb-4">
              Turn your style into income
            </h2>
            <p className="text-[#888891] text-lg max-w-xl mx-auto mb-8">
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
      </section>

      {/* Footer */}
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
