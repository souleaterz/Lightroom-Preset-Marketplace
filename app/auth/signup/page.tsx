'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username, display_name: username },
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c5cfc]/5 to-[#e05c7a]/5" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#f0f0f0] text-lg">
              Preset<span className="text-[#7c5cfc]">Scout</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-[#f0f0f0]">Create your account</h1>
          <p className="text-[#888891] mt-1">Free to join. Start buying or selling presets.</p>
        </div>

        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#7c5cfc]/10 flex items-center justify-center mx-auto">
                <Mail className="h-7 w-7 text-[#7c5cfc]" />
              </div>
              <h2 className="font-semibold text-[#f0f0f0]">Check your email</h2>
              <p className="text-sm text-[#888891]">
                We sent a confirmation link to <strong className="text-[#f0f0f0]">{email}</strong>
              </p>
            </div>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={handleGoogle} type="button">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-white/[0.08]" />
                <span className="text-xs text-[#888891]">or</span>
                <div className="flex-1 border-t border-white/[0.08]" />
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="mb-1.5">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#888891] mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#7c5cfc] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
