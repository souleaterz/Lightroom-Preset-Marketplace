'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Read-only text with a copy button (referral links, share text). */
export function CopyField({ value, multiline }: { value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback for older / locked-down browsers.
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-stretch gap-2">
      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 bg-overlay border border-line rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none"
        />
      ) : (
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 bg-overlay border border-line rounded-lg px-3 py-2 text-sm text-foreground font-mono truncate focus:outline-none"
        />
      )}
      <button
        onClick={copy}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 rounded-lg bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4de8] transition-colors"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
