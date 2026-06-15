'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Camera } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, createAvatarUploadUrl } from './actions'
import type { Profile } from '@/types/database'

export function AccountForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  })

  const initial = (form.display_name || form.username || '?').trim()[0]?.toUpperCase() || '?'

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be 5 MB or smaller.')
      return
    }
    setError(null)
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const target = await createAvatarUploadUrl(ext)
      if (target.error || !target.bucket || !target.path || !target.token) {
        throw new Error(target.error || 'Could not prepare upload')
      }
      const { error: upErr } = await supabase.storage
        .from(target.bucket)
        .uploadToSignedUrl(target.path, target.token, file)
      if (upErr) throw upErr
      const url = supabase.storage.from(target.bucket).getPublicUrl(target.path).data.publicUrl
      // Cache-bust so the new image shows immediately.
      const busted = `${url}?v=${Date.now()}`
      setAvatarUrl(busted)
      // Persist right away so it sticks even if they don't hit Save.
      await updateProfile({ ...form, avatar_url: busted })
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setAvatarUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile({ ...form, avatar_url: avatarUrl })

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
      <div className="bg-surface border border-line rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-2xl font-semibold text-[#7c5cfc]">{initial}</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => fileRef.current?.click()}
            >
              {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {avatarUploading ? 'Uploading…' : 'Upload avatar'}
            </Button>
            <p className="text-xs text-muted mt-1.5">JPG, PNG or WebP, max 5 MB.</p>
          </div>
        </div>

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
            <span className="flex h-11 items-center px-3 rounded-l-lg border border-r-0 border-line bg-overlay text-muted text-sm">
              presetscout.com/seller/
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
