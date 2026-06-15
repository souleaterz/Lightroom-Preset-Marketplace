'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  sellerId: string
  isSignedIn: boolean
  initialFollowing: boolean
  initialCount: number
}

export function FollowButton({ sellerId, isSignedIn, initialFollowing, initialCount }: FollowButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!isSignedIn) {
      router.push(`/auth/signin?next=/seller/${sellerId}`)
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('seller_id', sellerId)
      setFollowing(false)
      setCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, seller_id: sellerId })
      setFollowing(true)
      setCount((c) => c + 1)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={toggle}
        disabled={loading}
        variant={following ? 'outline' : 'default'}
        className={cn(following && 'text-muted')}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : following ? (
          <><UserCheck className="h-4 w-4" /> Following</>
        ) : (
          <><UserPlus className="h-4 w-4" /> Follow</>
        )}
      </Button>
      <span className="text-sm text-muted">
        {count} follower{count === 1 ? '' : 's'}
      </span>
    </div>
  )
}
