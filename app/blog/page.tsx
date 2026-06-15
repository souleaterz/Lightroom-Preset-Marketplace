export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { getAllPosts } from '@/lib/blog'
import { formatDate } from '@/lib/utils'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog — Lightroom Presets, Tips & Selling Guides',
  description:
    'Guides, inspiration and selling tips for Lightroom presets — how to install presets, choose the right looks, and earn from your editing style.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: `Blog | ${siteConfig.name}`,
    description: 'Guides, inspiration and selling tips for Lightroom presets.',
    url: `${siteConfig.url}/blog`,
  },
}

export default async function BlogIndexPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-semibold text-foreground">The PresetScout Blog</h1>
          <p className="text-muted mt-2 max-w-2xl">
            Guides, inspiration and selling tips — get more from your presets, and turn your editing
            style into income.
          </p>
        </header>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-2xl overflow-hidden border border-line bg-surface hover:border-line-strong transition-colors mb-10"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px]">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-brand font-medium mb-3">
                  {featured.tags.slice(0, 2).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-brand/10">{t}</span>
                  ))}
                </div>
                <h2 className="text-2xl font-semibold text-foreground group-hover:text-brand transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted mt-2 leading-relaxed">{featured.description}</p>
                <p className="text-xs text-muted mt-4">
                  {formatDate(featured.date)} · {featured.readingMinutes} min read
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Rest */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden border border-line bg-surface hover:border-line-strong transition-colors flex flex-col"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-brand font-medium mb-2">
                  {post.tags.slice(0, 1).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-brand/10">{t}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
                <p className="text-xs text-muted mt-auto pt-4">
                  {formatDate(post.date)} · {post.readingMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
