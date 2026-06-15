'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Menu, X, User, Library, LayoutDashboard, LogOut, Heart, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSellerProfile } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

interface NavbarProps {
  user?: SupabaseUser | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const supabase = createClient()

  // Members are buyers by default; only sellers see the dashboard.
  useEffect(() => {
    if (!user) {
      setIsSeller(false)
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('is_seller, stripe_account_id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (active) setIsSeller(isSellerProfile(data))
      })
    return () => {
      active = false
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-nav backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#e05c7a] flex items-center justify-center">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground text-lg tracking-tight">
              Preset<span className="text-[#7c5cfc]">Scout</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm text-muted hover:text-foreground transition-colors">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/wishlist" className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  Wishlist
                </Link>
                <Link href="/library" className="text-sm text-muted hover:text-foreground transition-colors">
                  Library
                </Link>
                {isSeller ? (
                  <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/sell" className="text-sm text-[#7c5cfc] hover:text-[#cbb9ff] transition-colors inline-flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5" />
                    Become a Seller
                  </Link>
                )}
                <ThemeToggle />
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-9 h-9 rounded-full bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 flex items-center justify-center text-[#7c5cfc] hover:bg-[#7c5cfc]/30 transition-all"
                  >
                    <User className="h-4 w-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-surface border border-line rounded-xl shadow-2xl py-1 z-50">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-overlay transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-3.5 w-3.5" />
                        Account
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-overlay transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="h-3.5 w-3.5" />
                        Wishlist
                      </Link>
                      <Link
                        href="/library"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-overlay transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Library className="h-3.5 w-3.5" />
                        Library
                      </Link>
                      {isSeller ? (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-overlay transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/sell"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#7c5cfc] hover:text-[#cbb9ff] hover:bg-overlay transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Store className="h-3.5 w-3.5" />
                          Become a Seller
                        </Link>
                      )}
                      <div className="border-t border-line my-1" />
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
                <ThemeToggle />
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-muted hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-canvas px-4 py-4 space-y-3">
          <Link href="/browse" className="block text-sm text-muted hover:text-foreground py-2 transition-colors">
            Browse Presets
          </Link>
          {user ? (
            <>
              <Link href="/wishlist" className="block text-sm text-muted hover:text-foreground py-2 transition-colors">
                Wishlist
              </Link>
              <Link href="/library" className="block text-sm text-muted hover:text-foreground py-2 transition-colors">
                My Library
              </Link>
              {isSeller ? (
                <Link href="/dashboard" className="block text-sm text-muted hover:text-foreground py-2 transition-colors">
                  Seller Dashboard
                </Link>
              ) : (
                <Link href="/sell" className="block text-sm text-[#7c5cfc] hover:text-[#cbb9ff] py-2 transition-colors">
                  Become a Seller
                </Link>
              )}
              <Link href="/account" className="block text-sm text-muted hover:text-foreground py-2 transition-colors">
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
