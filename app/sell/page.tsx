export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  Sparkles, DollarSign, Wallet, Eye, SlidersHorizontal, Users, ShieldCheck,
  UserPlus, Upload, Tag, ArrowRight, Check,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { HeroShowcase } from '@/components/HeroShowcase'
import { createClient } from '@/lib/supabase/server'
import { isSellerProfile } from '@/lib/utils'
import { PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { siteConfig } from '@/lib/site'
import { BecomeSellerButton } from './BecomeSellerButton'

const SELLER_PHOTO = 'https://picsum.photos/seed/presetscout-sell-1/1000/1250'
const creatorShare = 100 - PLATFORM_FEE_PERCENT // 90

export const metadata: Metadata = {
  title: 'Sell Lightroom Presets',
  description: `Sell your Lightroom presets on PresetScout and keep ${creatorShare}% of every sale. Free to list, fee-free first month, automatic Stripe payouts, and live before/after previews that sell for you.`,
  alternates: { canonical: '/sell' },
  openGraph: {
    type: 'website',
    title: `Sell Lightroom Presets | ${siteConfig.name}`,
    description: `Keep ${creatorShare}% of every sale. Free to list, fee-free first month, instant Stripe payouts.`,
    url: `${siteConfig.url}/sell`,
  },
}

const BENEFITS = [
  { icon: DollarSign, title: `Keep ${creatorShare}%`, desc: 'One flat 10% fee — no listing fees, no ad surcharges, no monthly costs. Once you add those up elsewhere, you keep more here.' },
  { icon: Sparkles, title: 'Fee-free first month', desc: 'Pay 0% for your first 30 days — your earliest sales are entirely yours to keep.' },
  { icon: Wallet, title: 'Automatic payouts', desc: 'Connect Stripe once and earnings land in your bank account after every sale.' },
  { icon: Eye, title: 'Previews that sell', desc: 'Every listing ships with a live before/after slider on real photos — buyers see exactly what they get.' },
  { icon: SlidersHorizontal, title: 'Your prices, no lock-in', desc: 'Set and change prices anytime. No subscriptions and no exclusivity — keep selling wherever else you do.' },
  { icon: Users, title: 'No audience needed', desc: 'Buyers discover presets through the marketplace — you don’t need a big following to start earning.' },
]

const STEPS = [
  { icon: UserPlus, title: 'Create your shop', desc: 'Sign up free and pick your seller handle. Takes under a minute.' },
  { icon: Upload, title: 'Upload with a before/after', desc: 'Add your preset file and a real before/after pair so the look sells itself.' },
  { icon: Tag, title: 'Set your price', desc: 'Choose what each preset or pack is worth — you’re in full control.' },
  { icon: Wallet, title: 'Get paid automatically', desc: `Publish, and every sale pays out ${creatorShare}% straight to your bank via Stripe.` },
]

const FAQ = [
  { q: 'What can I sell?', a: 'Lightroom presets in any common format — .xmp, .lrtemplate, DNG, or a zipped pack. Desktop and mobile presets are both welcome.' },
  { q: 'How much does it cost?', a: `Nothing to join or list. We take one flat ${PLATFORM_FEE_PERCENT}% per sale — no listing fees, no ad surcharges and no monthly costs, so it works out cheaper than marketplaces like Etsy once their extras stack up. And your first month is completely fee-free, so you keep 100% to start.` },
  { q: 'How do I get paid?', a: `Connect your Stripe account once and payouts land in your bank automatically after each sale. You keep ${creatorShare}%.` },
  { q: 'Do I need a big following?', a: 'No. Buyers discover presets through our marketplace, and your live before/after previews do the selling for you.' },
  { q: 'Can I set my own prices?', a: 'Yes — you have full control over pricing for every preset and pack, and you can change it anytime.' },
  { q: 'Do I have to sell exclusively here?', a: 'No. PresetScout isn’t exclusive — you’re free to keep selling the same presets on your own site or anywhere else. There’s nothing to lose by listing here too.' },
  { q: 'How quickly can I start?', a: 'Minutes. Create a free account, upload a preset with a before/after, set a price, and publish.' },
]

export default async function SellPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Already a seller? Straight to the dashboard.
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_seller, stripe_account_id')
      .eq('id', user.id)
      .single()
    if (isSellerProfile(profile)) redirect('/dashboard')
  }

  const Cta = ({ centered }: { centered?: boolean }) =>
    user ? (
      <BecomeSellerButton />
    ) : (
      <div className={`flex flex-col sm:flex-row items-center gap-3 ${centered ? 'justify-center' : 'justify-center lg:justify-start'}`}>
        <Link href="/auth/signup">
          <Button size="lg" className="text-base px-8 h-14">
            Start selling — it’s free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/auth/signin?next=/sell">
          <Button variant="outline" size="lg" className="text-base px-8 h-14">Sign in</Button>
        </Link>
      </div>
    )

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden px-4 pt-14 lg:pt-20 pb-20">
        <div className="hero-aurora" aria-hidden="true">
          <div className="blob" style={{ width: 520, height: 520, top: '-8%', left: '0%', background: 'radial-gradient(circle, rgba(124,92,252,0.45), transparent 60%)', animation: 'float-a 22s ease-in-out infinite' }} />
          <div className="blob" style={{ width: 480, height: 480, top: '5%', right: '-4%', background: 'radial-gradient(circle, rgba(224,92,122,0.4), transparent 60%)', animation: 'float-b 26s ease-in-out infinite' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 text-sm text-[#cbb9ff] mb-7 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Founding creators get a Founder badge + 0% fees for the first month
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.75rem] leading-[1.03] text-foreground mb-6">
              Sell your presets.{' '}
              <span className="gradient-text">Keep {creatorShare}%.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
              Turn the look people already love into income. List in minutes, set your own prices,
              and keep <span className="text-foreground font-semibold">{creatorShare}%</span> of every sale
              with instant payouts. Already sell elsewhere? Keep doing it — PresetScout isn’t exclusive,
              so there’s nothing to lose.
            </p>
            <Cta />
            <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted">
              {['Free to list', '0% fees first month', 'Instant Stripe payouts', 'No exclusivity'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#7c5cfc]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroShowcase src={SELLER_PHOTO} />
            <p className="mt-4 text-center text-sm text-muted">
              <span className="text-[#cbb9ff]">This is your listing.</span> Buyers drag to preview before they buy.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Benefits ───────── */}
      <section className="py-20 px-4 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3">Everything you need to sell</h2>
            <p className="text-muted">Built for photographers — not spreadsheets.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-7 hover:border-line-strong transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-[#7c5cfc]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="py-20 px-4 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3">Start selling in four steps</h2>
            <p className="text-muted">From sign-up to your first payout in minutes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item, i) => (
              <div key={item.title} className="relative p-7 bg-surface border border-line rounded-2xl">
                <div className="absolute top-5 right-5 font-mono text-4xl font-bold text-foreground/[0.06]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-[#7c5cfc]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Earnings transparency ───────── */}
      <section className="py-20 px-4 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3">Simple, honest pricing</h2>
            <p className="text-muted">No subscription. No listing fees. Just a flat {PLATFORM_FEE_PERCENT}% when you make a sale.</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-8">
            <div className="flex h-5 rounded-full overflow-hidden mb-5">
              <div className="bg-[#7c5cfc]" style={{ width: `${creatorShare}%` }} />
              <div className="bg-white/20" style={{ width: `${PLATFORM_FEE_PERCENT}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c5cfc]" />
                  <span className="font-mono text-xl font-bold text-foreground">{creatorShare}%</span>
                </div>
                <p className="text-xs text-muted mt-1">You keep</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-mono text-xl font-bold text-foreground">{PLATFORM_FEE_PERCENT}%</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <p className="text-xs text-muted mt-1">Platform fee</p>
              </div>
            </div>
            <div className="border-t border-line mt-6 pt-5 flex items-center gap-3 text-sm text-muted">
              <ShieldCheck className="h-5 w-5 text-[#7c5cfc] flex-shrink-0" />
              On a £10 preset you keep <span className="text-foreground font-semibold">£{(creatorShare / 10).toFixed(2)}</span> — and £10.00 during your fee-free first month.
            </div>
            <div className="border-t border-line mt-5 pt-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">What we don’t charge</p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {['No listing fees', 'No ad surcharges', 'No monthly subscription'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 text-muted">
                    <Check className="h-4 w-4 text-[#7c5cfc] flex-shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted mt-4">
                Marketplaces like Etsy add per-item listing fees, payment surcharges and Offsite-Ads cuts on top —
                which often pushes their real take well above ours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="py-20 px-4 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3">Questions, answered</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-surface px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-foreground">
                  {f.q}
                  <span className="ml-4 text-muted transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="text-sm text-muted leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="py-20 px-4 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/20 to-coral/10 border border-brand/20 p-10 md:p-16 text-center">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#7c5cfc]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Your style is worth paying for
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto mb-8">
                Join free, list your first preset today, and keep {creatorShare}% of every sale —
                100% for your first month.
              </p>
              <div className="flex justify-center">
                <Cta centered />
              </div>
              <p className="mt-6 text-sm text-muted">
                You stay a buyer too — selling just unlocks your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
