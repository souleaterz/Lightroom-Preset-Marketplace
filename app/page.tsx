export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Download, Shield, Zap, Camera, ShoppingBag } from 'lucide-react'
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

async function getFeaturedPresets(): Promise<Preset[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('presets')
      .select('*, profiles(id, username, display_name, avatar_url)')
      .eq('is_published', true)
      .order('downloads', { ascending: false })
      .limit(8)
    return (data as Preset[]) || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredPresets = await getFeaturedPresets()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-28 px-4 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7c5cfc]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-[#e05c7a]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 text-sm text-[#7c5cfc] mb-8">
            <Star className="h-3.5 w-3.5 fill-[#7c5cfc]" />
            <span>Trusted by 10,000+ photographers worldwide</span>
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
            Browse thousands of professional Lightroom presets created by top photographers.
            Instant download, one-time payment, yours forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <Button size="lg" className="text-base px-8 h-14">
                Browse Presets
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="text-base px-8 h-14">
                Sell Your Presets
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '10K+', label: 'Presets' },
              { value: '5K+', label: 'Sellers' },
              { value: '50K+', label: 'Downloads' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#f0f0f0] font-mono">{stat.value}</div>
                <div className="text-sm text-[#888891]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured presets */}
      {featuredPresets.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-semibold text-[#f0f0f0]">Featured Presets</h2>
                <p className="text-[#888891] mt-1">Handpicked by our team</p>
              </div>
              <Link href="/browse">
                <Button variant="outline" size="sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredPresets.map((preset) => (
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
                desc: 'Explore thousands of presets with interactive before/after sliders before you buy.',
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
                desc: 'Download your .xmp or .lrtemplate file and apply it in Lightroom instantly.',
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
            <Shield className="h-10 w-10 text-[#7c5cfc] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-semibold text-[#f0f0f0] mb-4">
              Turn your style into income
            </h2>
            <p className="text-[#888891] text-lg max-w-xl mx-auto mb-8">
              Join thousands of photographers earning with their presets. You keep 85% of every sale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base">
                  Start Selling Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="text-sm text-[#888891]">Free to list · 85% revenue share</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
              <ShoppingBag className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#f0f0f0]">
              Preset<span className="text-[#7c5cfc]">Market</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#888891]">
            <Link href="/browse" className="hover:text-[#f0f0f0] transition-colors">Browse</Link>
            <Link href="/auth/signup" className="hover:text-[#f0f0f0] transition-colors">Sell</Link>
          </div>
          <p className="text-xs text-[#888891]">© 2026 PresetMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
