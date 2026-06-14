'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateProfile } from './actions'
import type { Profile } from '@/types/database'

export function AccountForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile(form)

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-[#f0f0f0]">Profile</h2>
        <div>
          <Label htmlFor="display_name" className="mb-1.5">Display Name</Label>
          <Input
            id="display_name"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="username" className="mb-1.5">Username</Label>
          <div className="flex items-center gap-0">
            <span className="flex h-11 items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-white/[0.02] text-[#888891] text-sm">
              presetmarket.com/seller/
            </span>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              placeholder="yourname"
              className="rounded-l-none"
              minLength={3}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="bio" className="mb-1.5">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell buyers about yourself..."
            rows={4}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">Profile saved successfully!</p>}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </form>
  )
}
