'use client'

import React from 'react'
import { ReviewList } from '@/components/ReviewList'
import { ReviewForm } from '@/components/ReviewForm'
import type { Review, Purchase } from '@/types/database'

interface ReviewSectionProps {
  presetId: string
  reviews: Review[]
  ratingAvg: number
  ratingCount: number
  userPurchase: Purchase | null
}

export function ReviewSection({
  presetId,
  reviews,
  ratingAvg,
  ratingCount,
  userPurchase,
}: ReviewSectionProps) {
  const localReviews = reviews
  const hasReviewed = userPurchase
    ? localReviews.some((r) => r.purchase_id === userPurchase.id)
    : false

  return (
    <div className="space-y-8">
      {userPurchase && !hasReviewed && (
        <div className="p-6 bg-surface border border-line rounded-xl">
          <h3 className="text-base font-semibold text-foreground mb-4">Leave a Review</h3>
          <ReviewForm
            presetId={presetId}
            purchaseId={userPurchase.id}
          />
        </div>
      )}
      <ReviewList reviews={localReviews} ratingAvg={ratingAvg} ratingCount={ratingCount} />
    </div>
  )
}
