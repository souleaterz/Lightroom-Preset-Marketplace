import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import './globals.css'
import { WishlistProvider } from '@/components/WishlistProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'
import { ThemeScript } from '@/components/ThemeScript'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/lib/site'
import { getRates, currencyForCountry, isCurrencyCode } from '@/lib/currency'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Lightroom Presets Marketplace`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  // No global canonical here — it would be inherited by every child route and
  // make them all canonicalise to "/". Each page sets its own canonical.
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: `${siteConfig.name} — Lightroom Presets Marketplace`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Lightroom Presets Marketplace`,
    description: siteConfig.description,
    creator: siteConfig.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Pick the display currency: the visitor's saved choice, else inferred from
  // their country (Vercel geo header), else GBP. Rates are cached for 6h.
  const cookieCurrency = cookies().get('currency')?.value
  const country = headers().get('x-vercel-ip-country')
  const initialCurrency = isCurrencyCode(cookieCurrency)
    ? cookieCurrency
    : currencyForCountry(country)
  const rates = await getRates()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-canvas text-foreground antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteConfig.url}/browse?category={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteConfig.name,
              url: siteConfig.url,
              logo: `${siteConfig.url}/icon.svg`,
              description: siteConfig.description,
            }),
          }}
        />
        <CurrencyProvider initialCurrency={initialCurrency} rates={rates}>
          <WishlistProvider>
            {children}
            <Footer />
          </WishlistProvider>
        </CurrencyProvider>
        <Analytics />
      </body>
    </html>
  )
}
