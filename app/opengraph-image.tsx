import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const runtime = 'edge'
export const alt = `${siteConfig.name} — Lightroom Presets Marketplace`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default social-share card used for pages without their own image (home, browse…).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1530 55%, #2a1840 100%)',
          color: '#f0f0f0',
          fontFamily: 'sans-serif',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #7c5cfc, #e05c7a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            🧭
          </div>
          <div style={{ fontSize: 52, fontWeight: 700 }}>
            Preset<span style={{ color: '#a78bfa' }}>Scout</span>
          </div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          The marketplace for Lightroom presets
        </div>
        <div style={{ fontSize: 30, color: '#c9c9d1', marginTop: 28, maxWidth: 820 }}>
          Preview every look on real photos. Buy once, own it forever.
        </div>
      </div>
    ),
    size
  )
}
