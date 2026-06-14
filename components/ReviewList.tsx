import React from 'react'
import Image from 'next/image'
import { StarRating } from '@/components/StarRating'
import { formatDate } from '@/lib/utils'
import type { Review } from '@/types/database'

interface ReviewListProps {
  reviews: Review[]
  ratingAvg: number
  ratingCount: number
}

export function ReviewList({ reviews, ratingAvg, ratingCount }: ReviewListProps) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex items-start gap-8 p-6 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="text-center">
          <div className="text-5xl font-bold text-[#f0f0f0] font-mono">
            {ratingAvg > 0 ? ratingAvg.toFixed(1) : '—'}
          </div>
          <StarRating value={Math.round(ratingAvg)} size="sm" className="mt-2 justify-center" />
          <div className="text-xs text-[#888891] mt-1">{ratingCount} reviews</div>
        </div>
        <div className="flex-1 space-y-2">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-[#888891] w-6 text-right">{star}★</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: ratingCount > 0 ? `${(count / ratingCount) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-[#888891] w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-[#888891] text-sm text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 bg-[#111114] border border-white/[0.06] rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#7c5cfc]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {review.profiles?.avatar_url ? (
                    <Image
                      src={review.profiles.avatar_url}
                      alt={review.profiles.display_name || ''}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[#7c5cfc]">
                      {(review.profiles?.display_name || review.profiles?.username || 'A')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#f0f0f0]">
                      {review.profiles?.display_name || review.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-[#888891]">{formatDate(review.created_at)}</span>
                  </div>
                  <StarRating value={review.rating} size="sm" className="mt-1" />
                </div>
              </div>
              {review.body && (
                <p className="text-sm text-[#888891] leading-relaxed">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
