import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${siteConfig.name} — Lightroom Presets Marketplace`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0a0b',
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(124,92,252,0.45), transparent 45%), radial-gradient(circle at 85% 90%, rgba(224,92,122,0.40), transparent 45%)',
          color: '#f0f0f0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c5cfc, #e05c7a)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <path d="M16 6.5 18.4 13.6 25.5 16 18.4 18.4 16 25.5 13.6 18.4 6.5 16 13.6 13.6 16 6.5Z" fill="#fff" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          Your photos, transformed.
        </div>
        <div style={{ fontSize: 34, color: '#9a9aa3', marginTop: 28, maxWidth: 860 }}>
          {siteConfig.tagline} — preview before you buy, own it forever.
        </div>
      </div>
    ),
    { ...size }
  )
}
