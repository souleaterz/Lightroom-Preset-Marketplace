import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Apple touch icon — branded compass on the gradient tile.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c5cfc, #e05c7a)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <path d="M16 6.5 18.4 13.6 25.5 16 18.4 18.4 16 25.5 13.6 18.4 6.5 16 13.6 13.6 16 6.5Z" fill="#fff" />
          <circle cx="16" cy="16" r="2.1" fill="#7c5cfc" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
