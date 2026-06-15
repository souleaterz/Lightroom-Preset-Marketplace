import React from 'react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import type { DiscountCode } from '@/types/database'
import { CodeManager } from './CodeManager'

export const metadata = { title: 'Discount Codes' }

export default async function CodesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard/codes')

  const { data } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const codes = (data as DiscountCode[]) || []

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Discount Codes</h1>
          <p className="text-muted mt-1">
            Create codes buyers can enter at checkout for a percentage off your presets.
            You absorb the discount; the platform fee is taken on the amount paid.
          </p>
        </div>
        <CodeManager initialCodes={codes} />
      </div>
    </div>
  )
}
