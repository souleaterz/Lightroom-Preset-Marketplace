'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, User, Library, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  user?: SupabaseUser | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0b]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#f0f0f0] text-lg tracking-tight">
              Preset<span className="text-[#7c5cfc]">Market</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm text-[#888891] hover:text-[#f0f0f0] transition-colors">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/library" className="text-sm text-[#888891] hover:text-[#f0f0f0] transition-colors">
                  Library
                </Link>
                <Link href="/dashboard" className="text-sm text-[#888891] hover:text-[#f0f0f0] transition-colors">
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-9 h-9 rounded-full bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center text-[#7c5cfc] hover:bg-[#7c5cfc]/30 transition-all"
                  >
                    <User className="h-4 w-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-[#111114] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#888891] hover:text-[#f0f0f0] hover:bg-white/5 transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-3.5 w-3.5" />
                        Account
                      </Link>
                      <Link
                        href="/library"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#888891] hover:text-[#f0f0f0] hover:bg-white/5 transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Library className="h-3.5 w-3.5" />
                        Library
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#888891] hover:text-[#f0f0f0] hover:bg-white/5 transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Dashboard
                      </Link>
                      <div className="border-t border-white/[0.06] my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#888891] hover:text-[#f0f0f0] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0b] px-4 py-4 space-y-3">
          <Link href="/browse" className="block text-sm text-[#888891] hover:text-[#f0f0f0] py-2 transition-colors">
            Browse Presets
          </Link>
          {user ? (
            <>
              <Link href="/library" className="block text-sm text-[#888891] hover:text-[#f0f0f0] py-2 transition-colors">
                My Library
              </Link>
              <Link href="/dashboard" className="block text-sm text-[#888891] hover:text-[#f0f0f0] py-2 transition-colors">
                Seller Dashboard
              </Link>
              <Link href="/account" className="block text-sm text-[#888891] hover:text-[#f0f0f0] py-2 transition-colors">
                Account
              </Link>
              <button
                onClick={handleSignOut}
                className="block text-sm text-red-400 py-2 w-full text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
