/**
 * Display-only multi-currency. Prices are stored and charged in GBP (the base /
 * settlement currency); these helpers convert GBP amounts to a visitor's chosen
 * currency for display. The actual Stripe charge stays GBP.
 */

export type CurrencyCode =
  | 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'BRL'

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  label: string
  locale: string
}

export const BASE_CURRENCY: CurrencyCode = 'GBP'

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', locale: 'en-IE' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  BRL: { code: 'BRL', symbol: 'R$', label: 'Brazilian Real', locale: 'pt-BR' },
}

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[]

export function isCurrencyCode(x: string | undefined | null): x is CurrencyCode {
  return !!x && Object.prototype.hasOwnProperty.call(CURRENCIES, x)
}

/** Map an ISO-3166 alpha-2 country to a display currency (falls back to GBP). */
const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD', NZ: 'AUD',
  JP: 'JPY',
  IN: 'INR',
  BR: 'BRL',
  // Eurozone
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR', FR: 'EUR', DE: 'EUR',
  GR: 'EUR', IE: 'EUR', IT: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR',
  NL: 'EUR', PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR', HR: 'EUR',
}

export function currencyForCountry(country?: string | null): CurrencyCode {
  if (!country) return BASE_CURRENCY
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? BASE_CURRENCY
}

/** Exchange rates keyed by currency, expressed as units per 1 GBP (GBP is always 1). */
export type Rates = Partial<Record<CurrencyCode, number>> & { GBP: number }

// Sensible static fallback if the live rate fetch fails. Approximate; only used
// for display estimates, so slight drift is fine.
export const FALLBACK_RATES: Rates = {
  GBP: 1, USD: 1.27, EUR: 1.17, CAD: 1.72, AUD: 1.92, JPY: 190, INR: 106, BRL: 6.4,
}

/** Fetch GBP-based rates (cached 6h via Next fetch cache). Never throws. */
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/GBP', {
      next: { revalidate: 21600 },
    })
    if (!res.ok) throw new Error('rate fetch failed')
    const data = await res.json()
    const r = data?.rates
    if (!r || typeof r.USD !== 'number') throw new Error('no rates in response')
    const out: Rates = { GBP: 1 }
    for (const code of CURRENCY_CODES) {
      if (typeof r[code] === 'number') out[code] = r[code]
    }
    return out
  } catch {
    return FALLBACK_RATES
  }
}

/** Convert a GBP amount in pence to major units of the target currency. */
export function convertFromGbpPence(gbpPence: number, currency: CurrencyCode, rates: Rates): number {
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1
  return (gbpPence / 100) * rate
}

/** Format a GBP pence amount in the target currency (e.g. "$12.69"). */
export function formatMoney(gbpPence: number, currency: CurrencyCode, rates: Rates): string {
  const info = CURRENCIES[currency] ?? CURRENCIES[BASE_CURRENCY]
  const amount = convertFromGbpPence(gbpPence, info.code, rates)
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.code,
  }).format(amount)
}
