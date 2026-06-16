'use client'

import React from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

interface PriceProps {
  /** Amount in GBP pence (the stored/charged value). */
  gbpPence: number
  /** Show "Free" for £0 amounts (default true — for catalog prices). */
  showFree?: boolean
  className?: string
}

/** Displays a GBP pence amount in the visitor's chosen currency. */
export function Price({ gbpPence, showFree = true, className }: PriceProps) {
  const { format } = useCurrency()
  if (showFree && gbpPence <= 0) {
    return <span className={className}>Free</span>
  }
  return <span className={className}>{format(gbpPence)}</span>
}
