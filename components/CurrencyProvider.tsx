'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  BASE_CURRENCY,
  formatMoney,
  type CurrencyCode,
  type Rates,
} from '@/lib/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  rates: Rates
  /** Format a GBP pence amount in the active currency. */
  format: (gbpPence: number) => string
  /** True when the active display currency differs from the charge currency. */
  isConverted: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  initialCurrency,
  rates,
  children,
}: {
  initialCurrency: CurrencyCode
  rates: Rates
  children: React.ReactNode
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency)

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
    // Persist the choice for a year so SSR renders the right currency next time.
    document.cookie = `currency=${c};path=/;max-age=31536000;samesite=lax`
  }, [])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      format: (gbpPence: number) => formatMoney(gbpPence, currency, rates),
      isConverted: currency !== BASE_CURRENCY,
    }),
    [currency, setCurrency, rates]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    // Defensive fallback so a stray usage outside the provider never crashes.
    return {
      currency: BASE_CURRENCY,
      setCurrency: () => {},
      rates: { GBP: 1 },
      format: (gbpPence: number) => formatMoney(gbpPence, BASE_CURRENCY, { GBP: 1 }),
      isConverted: false,
    }
  }
  return ctx
}
