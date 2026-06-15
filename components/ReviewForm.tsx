'use client'

import React, { useState } from 'react'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReviewFormProps {
  presetId: string
  purchaseId: string
  onSuccess?: () => void
}

export function ReviewForm({ presetId, purchaseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: presetId, purchase_id: purchaseId, rating, body }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit review')
      }
      setSubmitted(true)
      onSuccess?.()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 rounded-xl text-center">
        <p className="text-foreground font-medium">Thank you for your review!</p>
        <p className="text-sm text-muted mt-1">Your feedback helps other photographers.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2">Your rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <Label htmlFor="review-body" className="mb-2">Write a review (optional)</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience with this preset..."
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
