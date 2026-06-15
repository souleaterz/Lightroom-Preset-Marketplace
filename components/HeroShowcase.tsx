'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

const AFTER_FILTER = 'saturate(1.32) contrast(1.1) brightness(1.03) sepia(0.16) hue-rotate(-6deg)'
const BEFORE_FILTER = 'saturate(0.5) contrast(0.92) brightness(1.08)'

/**
 * A draggable before/after of a single photo, color-graded with CSS to
 * demonstrate what a preset does. Self-contained — no real preset data needed.
 */
export function HeroShowcase({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(52)
  const [dragging, setDragging] = useState(false)

  const update = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPos((x / rect.width) * 100)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => update(e.clientX)
    const touch = (e: TouchEvent) => update(e.touches[0].clientX)
    const up = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', touch, { passive: true })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', touch)
      window.removeEventListener('touchend', up)
    }
  }, [dragging, update])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { e.preventDefault(); setDragging(true); update(e.clientX) }}
      onTouchStart={(e) => { setDragging(true); update(e.touches[0].clientX) }}
      className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl select-none cursor-ew-resize bg-gradient-to-br from-[#241b3a] to-[#3a2230]"
      style={{ boxShadow: '0 30px 80px -20px rgba(124,92,252,0.45)' }}
    >
      {/* After (graded, full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Edited photo"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: AFTER_FILTER }}
        draggable={false}
      />
      <span className="absolute bottom-3 right-3 z-20 text-[11px] font-semibold tracking-wide text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
        AFTER
      </span>

      {/* Before (flat, clipped to the left) */}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <div className="relative h-full" style={{ width: `${10000 / pos}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Original photo"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: BEFORE_FILTER }}
            draggable={false}
          />
        </div>
        <span className="absolute bottom-3 left-3 z-20 text-[11px] font-semibold tracking-wide text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
          BEFORE
        </span>
      </div>

      {/* Divider + handle */}
      <div
        className="absolute inset-y-0 z-10 flex items-center justify-center pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 h-full bg-white/85" />
        <div className="absolute w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M5 8L2 5M2 5L5 2M2 5H14M11 8L14 5M14 5L11 2M14 5H2" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Drag to compare before and after"
      />
    </div>
  )
}
