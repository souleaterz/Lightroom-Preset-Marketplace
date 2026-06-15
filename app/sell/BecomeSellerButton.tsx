'use client'

import React, { useState, useTransition } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { becomeSeller } from './actions'

export function BecomeSellerButton() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const res = await becomeSeller()
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button size="lg" className="text-base" onClick={handleClick} disabled={pending}>
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Become a Seller
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
