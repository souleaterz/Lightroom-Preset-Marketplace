import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, DollarSign, Package, AlertCircle, Plus } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/RevenueChart'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Purchase, Profile, Preset } from '@/types/database'

export const metadata = { title: 'Seller Dashboard' }

function generateRevenueData(purchases: Purchase[]) {
  const days: Record<string, number> = {}
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    days[key] = 0
  }
  purchases.forEach((p) => {
    const d = new Date(p.created_at)
    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    if (key in days) {
      days[key] += (p.seller_payout_cents || 0) / 100
    }
  })
  return Object.entries(days).map(([date, revenue]) => ({ date, revenue }))
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const seller = profile as Profile | null

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, presets(title, id)')
    .eq('status', 'succeeded')
    .in('preset_id',
      (await supabase.from('presets').select('id').eq('seller_id', user.id)).data?.map((p: { id: string }) => p.id) || []
    )
    .order('created_at', { ascending: false })
    .limit(100)

  const allPurchases = (purchases as Purchase[]) || []
  const thisMonth = allPurchases.filter((p) => {
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalEarned = allPurchases.reduce((s, p) => s + (p.seller_payout_cents || 0), 0)
  const monthEarned = thisMonth.reduce((s, p) => s + (p.seller_payout_cents || 0), 0)

  const { data: presetsData } = await supabase
    .from('presets')
    .select('*')
    .eq('seller_id', user.id)
    .order('downloads', { ascending: false })
    .limit(5)

  const topPresets = (presetsData as Preset[]) || []
  const revenueData = generateRevenueData(allPurchases.slice(0, 100))
  const recentSales = allPurchases.slice(0, 10)

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted mt-1">Welcome back, {seller?.display_name || seller?.username}</p>
          </div>
          <Link href="/dashboard/presets/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Preset
            </Button>
          </Link>
        </div>

        {/* Stripe Connect banner */}
        {!seller?.stripe_account_id && (
          <div className="mb-6 flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">Connect Stripe to receive payouts</p>
              <p className="text-xs text-amber-400/70 mt-1">
                Set up Stripe Connect to receive 92% of every sale directly to your bank account.
              </p>
            </div>
            <a href="/api/stripe/connect/onboard">
              <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                Connect Stripe
              </Button>
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earned', value: formatPrice(totalEarned), icon: DollarSign, color: 'text-green-400' },
            { label: 'This Month', value: formatPrice(monthEarned), icon: TrendingUp, color: 'text-[#7c5cfc]' },
            { label: 'Total Sales', value: allPurchases.length.toString(), icon: Package, color: 'text-[#e05c7a]' },
            { label: 'Published', value: topPresets.filter((p) => p.is_published).length.toString(), icon: Package, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="font-mono text-2xl font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-surface border border-line rounded-xl p-6 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-5">Revenue — Last 30 days</h2>
          <RevenueChart data={revenueData} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent sales */}
          <div className="bg-surface border border-line rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Recent Sales</h2>
              <Link href="/dashboard/presets" className="text-xs text-[#7c5cfc] hover:underline">
                View all
              </Link>
            </div>
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted py-4">No sales yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate">
                        {(sale as Purchase & { presets?: { title: string } }).presets?.title || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted">{formatDate(sale.created_at)}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="font-mono text-sm text-green-400">
                        +{formatPrice(sale.seller_payout_cents || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top presets */}
          <div className="bg-surface border border-line rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Top Presets</h2>
              <Link href="/dashboard/presets" className="text-xs text-[#7c5cfc] hover:underline">
                Manage
              </Link>
            </div>
            {topPresets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted mb-4">No presets yet</p>
                <Link href="/dashboard/presets/new">
                  <Button size="sm">Upload your first preset</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topPresets.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <Link href={`/preset/${preset.id}`} className="text-foreground hover:text-white transition-colors truncate block">
                        {preset.title}
                      </Link>
                      <p className="text-xs text-muted">{preset.downloads} downloads</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <Badge variant={preset.is_published ? 'default' : 'secondary'}>
                        {preset.is_published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
