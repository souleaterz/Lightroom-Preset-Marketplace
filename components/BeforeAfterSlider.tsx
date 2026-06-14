'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
  aspectRatio?: number
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  className,
  aspectRatio = 3 / 2,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      updatePosition(e.touches[0].clientX)
    },
    [updatePosition]
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      updatePosition(e.clientX)
    }
    const onMouseUp = () => setIsDragging(false)
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      updatePosition(e.touches[0].clientX)
    }
    const onTouchEnd = () => setIsDragging(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, updatePosition])

  const paddingBottom = `${(1 / aspectRatio) * 100}%`

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-xl select-none',
        isDragging ? 'cursor-ew-resize' : 'cursor-ew-resize',
        className
      )}
      style={{ paddingBottom }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After image (full width, bottom layer) */}
      <div className="absolute inset-0">
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover"
          draggable={false}
          priority
        />
        <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
          After
        </span>
      </div>

      {/* Before image (clipped to left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div className="relative w-full h-full" style={{ width: `${10000 / position}%` }}>
          <Image
            src={beforeSrc}
            alt={beforeAlt}
            fill
            className="object-cover"
            draggable={false}
            priority
          />
        </div>
        <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
          Before
        </span>
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 z-10 flex items-center justify-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 h-full bg-white/80" />
        <div className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 8L2 5M2 5L5 2M2 5H14M11 8L14 5M14 5L11 2M14 5H2" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Invisible range input for keyboard accessibility */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Compare before and after"
      />
    </div>
  )
}
