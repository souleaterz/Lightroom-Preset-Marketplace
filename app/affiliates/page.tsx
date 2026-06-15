export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Users, Link2, Wallet, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { PLATFORM_FEE_PERCENT, AFFILIATE_FEE_PERCENT } from '@/lib/stripe'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Affiliate Program',
  description:
    'Earn recurring income by helping photographers start selling on PresetScout. Affiliates earn 5% of every sale from creators they onboard.',
  alternates: { canonical: '/affiliates' },
  openGraph: {
    type: 'website',
    title: `Affiliate Program | ${siteConfig.name}`,
    description: 'Help photographers start selling and earn 5% of every sale they make.',
    url: `${siteConfig.url}/affiliates`,
  },
}

const creatorShare = 100 - PLATFORM_FEE_PERCENT // 90
const platformShare = PLATFORM_FEE_PERCENT - AFFILIATE_FEE_PERCENT // 5

const SPLIT = [
  { label: 'Creator keeps', value: creatorShare, color: 'bg-[#7c5cfc]' },
  { label: 'You earn', value: AFFILIATE_FEE_PERCENT, color: 'bg-[#e05c7a]' },
  { label: 'PresetScout', value: platformShare, color: 'bg-white/20' },
]

const STEPS = [
  {
    icon: Users,
    title: 'Bring creators in',
    desc: 'Introduce photographers and presets makers to PresetScout and help them set up their shop.',
  },
  {
    icon: Link2,
    title: 'They sell, you’re credited',
    desc: 'Every creator you onboard is linked to your affiliate account for the life of their shop.',
  },
  {
    icon: Wallet,
    title: 'Earn on every sale',
    desc: `You earn ${AFFILIATE_FEE_PERCENT}% of each sale they make — paid out automatically, no caps.`,
  },
]

export default async function AffiliatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Auto-accept: signed-in members go straight to their dashboard (which
  // enrolls them); signed-out visitors sign in first and land there after.
  const joinHref = user ? '/affiliate' : '/auth/signin?next=/affiliate'

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 text-xs font-medium text-[#cbb9ff] mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            PresetScout Affiliate Program
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Grow the community, earn for life
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto mb-9">
            Help photographers start selling their presets on PresetScout and earn{' '}
            <strong className="text-foreground">{AFFILIATE_FEE_PERCENT}% of every sale</strong> they
            make — for as long as their shop is open.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={joinHref}>
              <Button size="lg" className="text-base">
                Become an affiliate
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-sm text-muted">Free to join · Instant approval · Dashboard &amp; tools included</span>
          </div>
        </div>

        {/* Fee split */}
        <div className="mt-16 rounded-2xl border border-line bg-surface p-8">
          <h2 className="text-xl font-semibold text-foreground mb-1">How the {PLATFORM_FEE_PERCENT}% fee works</h2>
          <p className="text-muted text-sm mb-6">
            PresetScout charges a flat {PLATFORM_FEE_PERCENT}% on each sale. When a creator was
            referred by an affiliate, half of that fee goes to the affiliate.
          </p>

          {/* Stacked bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-5">
            {SPLIT.map((s) => (
              <div key={s.label} className={s.color} style={{ width: `${s.value}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {SPLIT.map((s) => (
              <div key={s.label}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="font-mono text-lg font-bold text-foreground">{s.value}%</span>
                </div>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-7">
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-[#7c5cfc]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/15 to-coral/10 p-10 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Ready to get started?</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Join in seconds — get your referral link, dashboard, and onboarding tools instantly.
          </p>
          <Link href={joinHref}>
            <Button size="lg">Become an affiliate <ArrowRight className="h-5 w-5" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
