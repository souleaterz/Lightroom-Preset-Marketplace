export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, TrendingUp, Wallet, Package, ArrowUpRight, Share2, BookOpen } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { CopyField } from '@/components/CopyField'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAffiliate, getAffiliateData } from '@/lib/affiliate'
import { formatPrice, formatDate } from '@/lib/utils'
import { AFFILIATE_FEE_PERCENT, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { siteConfig } from '@/lib/site'

export const metadata = { title: 'Affiliate Dashboard' }

export default async function AffiliateDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/affiliate')

  // Auto-accept: visiting the dashboard enrolls you as an affiliate.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_affiliate, affiliate_code, display_name, username')
    .eq('id', user.id)
    .single()

  const code = await ensureAffiliate(user.id, profile)
  const data = await getAffiliateData(user.id, code)

  const shareText =
    `I sell Lightroom presets on PresetScout — you can too, and keep ${100 - PLATFORM_FEE_PERCENT}% of every sale. ` +
    `Start here: ${data.referralUrl}`

  const stats = [
    { label: 'Creators referred', value: String(data.totalCreators), icon: Users, color: 'text-[#7c5cfc]' },
    { label: 'Active creators', value: String(data.activeCreators), icon: Package, color: 'text-blue-400' },
    { label: 'Sales generated', value: String(data.salesCount), icon: TrendingUp, color: 'text-[#e05c7a]' },
    { label: 'Your earnings', value: formatPrice(data.earningsCents), icon: Wallet, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Affiliate Dashboard</h1>
          <p className="text-muted mt-1">
            Earn {AFFILIATE_FEE_PERCENT}% of every sale from creators you bring to PresetScout.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="font-mono text-2xl font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Referral link */}
          <div className="bg-surface border border-line rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="h-4 w-4 text-[#7c5cfc]" />
              <h2 className="text-base font-semibold text-foreground">Your referral link</h2>
            </div>
            <p className="text-sm text-muted mb-4">
              Share this with photographers. Anyone who starts selling after clicking it is credited
              to you for life.
            </p>
            <CopyField value={data.referralUrl} />
            <p className="text-xs text-muted mt-3">
              Your code: <span className="font-mono text-foreground">{data.code}</span>
            </p>
          </div>

          {/* Share template */}
          <div className="bg-surface border border-line rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-[#7c5cfc]" />
              <h2 className="text-base font-semibold text-foreground">Ready-to-send message</h2>
            </div>
            <p className="text-sm text-muted mb-4">
              A short pitch you can DM or email to photographers you know.
            </p>
            <CopyField value={shareText} multiline />
          </div>
        </div>

        {/* Onboarding tools */}
        <div className="bg-surface border border-line rounded-xl p-6 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">Tools to onboard creators</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/blog/how-to-sell-lightroom-presets"
              className="group rounded-xl border border-line p-4 hover:border-line-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Selling guide</span>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
              </div>
              <p className="text-xs text-muted mt-1">Share our “how to sell presets” article.</p>
            </Link>
            <Link
              href="/sell"
              className="group rounded-xl border border-line p-4 hover:border-line-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Seller landing page</span>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
              </div>
              <p className="text-xs text-muted mt-1">Show creators what they get.</p>
            </Link>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-line p-4 hover:border-line-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Share on WhatsApp</span>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
              </div>
              <p className="text-xs text-muted mt-1">Send your link in one tap.</p>
            </a>
          </div>
        </div>

        {/* Referred creators */}
        <div className="bg-surface border border-line rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Your creators</h2>
          {data.creators.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-10 w-10 text-muted mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">No creators yet</p>
              <p className="text-sm text-muted">
                Share your referral link to start earning. Every creator you bring shows up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-line">
                    <th className="pb-2 font-medium">Creator</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium text-right">Sales</th>
                    <th className="pb-2 font-medium text-right">Your earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {data.creators.map((c) => (
                    <tr key={c.id} className="border-b border-line last:border-0">
                      <td className="py-3">
                        <Link href={`/seller/${c.username}`} className="text-foreground hover:text-brand transition-colors">
                          {c.displayName || c.username}
                        </Link>
                        {!c.isSeller && <span className="ml-2 text-xs text-muted">(not selling yet)</span>}
                      </td>
                      <td className="py-3 text-muted">{formatDate(c.joinedAt)}</td>
                      <td className="py-3 text-right text-muted">{c.salesCount}</td>
                      <td className="py-3 text-right font-mono text-green-400">{formatPrice(c.earningsCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-muted mt-6">
          Earnings are an estimate of your share of platform fees and are settled to your connected
          payout account. Questions? Email{' '}
          <a href="mailto:affiliates@presetscout.com" className="text-brand hover:underline">
            affiliates@{siteConfig.url.replace(/^https?:\/\//, '')}
          </a>.
        </p>
      </div>
    </div>
  )
}
