export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Eye, Star, Compass, Sparkles, DollarSign, Tag } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { isSellerProfile } from '@/lib/utils'
import { BecomeSellerButton } from './BecomeSellerButton'

export const metadata = { title: 'Become a Seller' }

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

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 text-xs font-medium text-[#cbb9ff] mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Founding creators: 0% fees for your first month
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#f0f0f0] mb-4">
            Turn your style into income
          </h1>
          <p className="text-[#9a9aa3] text-lg max-w-xl mx-auto mb-9">
            List your presets, set your own price, and keep 92% of every sale. Free to join —
            and your first month is completely fee-free.
          </p>

          {user ? (
            <BecomeSellerButton />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base">Create a free account</Button>
              </Link>
              <Link href="/auth/signin?next=/sell">
                <Button variant="outline" size="lg" className="text-base">Sign in</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: DollarSign, title: 'Keep 92%', desc: 'Set your own prices and keep the lion’s share of every sale. No subscription required.' },
            { icon: Tag, title: 'Zero fees to start', desc: 'Your first month is completely fee-free, so your earliest sales are entirely yours.' },
            { icon: Eye, title: 'Sell with confidence', desc: 'Every listing ships with a live before/after slider that sells the look for you.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/[0.08] bg-[#111114] p-7">
              <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-5">
                <Icon className="h-6 w-6 text-[#7c5cfc]" />
              </div>
              <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">{title}</h3>
              <p className="text-sm text-[#888891] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-[#888891]">
          <Star className="h-4 w-4 text-[#7c5cfc]" />
          You stay a buyer too — becoming a seller just unlocks your dashboard.
          <Compass className="h-4 w-4 text-[#7c5cfc]" />
        </div>
      </div>
    </div>
  )
}
