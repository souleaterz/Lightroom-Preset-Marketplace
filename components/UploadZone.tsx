'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  accept?: string
  maxSize?: number
  onFile: (file: File) => void
  file?: File | null
  onClear?: () => void
  label?: string
  hint?: string
  className?: string
}

export function UploadZone({
  accept = '.xmp,.lrtemplate',
  maxSize = 50 * 1024 * 1024,
  onFile,
  file,
  onClear,
  label = 'Drop your preset file here',
  hint = '.xmp or .lrtemplate, up to 50 MB',
  className,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = useCallback((f: File) => {
    setError(null)
    const ext = f.name.split('.').pop()?.toLowerCase()
    const allowed = accept.split(',').map((a) => a.trim().replace('.', '').toLowerCase())
    if (!ext || !allowed.includes(ext)) {
      setError(`Invalid file type. Allowed: ${accept}`)
      return
    }
    if (f.size > maxSize) {
      setError(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)} MB`)
      return
    }
    onFile(f)
  }, [accept, maxSize, onFile])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) validateAndSet(f)
    },
    [validateAndSet]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) validateAndSet(f)
  }

  if (file) {
    return (
      <div className={cn('flex items-center gap-4 p-4 bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 rounded-xl', className)}>
        <CheckCircle className="h-8 w-8 text-[#7c5cfc] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#f0f0f0] truncate">{file.name}</p>
          <p className="text-xs text-[#888891]">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#888891] hover:text-[#f0f0f0] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
          isDragOver
            ? 'border-[#7c5cfc] bg-[#7c5cfc]/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
        />
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors',
          isDragOver ? 'bg-[#7c5cfc]/20' : 'bg-white/5'
        )}>
          {isDragOver ? (
            <File className="h-7 w-7 text-[#7c5cfc]" />
          ) : (
            <Upload className="h-7 w-7 text-[#888891]" />
          )}
        </div>
        <p className="text-sm font-medium text-[#f0f0f0] mb-1">{label}</p>
        <p className="text-xs text-[#888891]">{hint}</p>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
