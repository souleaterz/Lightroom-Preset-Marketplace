export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { BlogContent } from '@/components/BlogContent'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { formatDate } from '@/lib/utils'
import { siteConfig } from '@/lib/site'

interface Props {
  params: { slug: string }
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Post not found' }
  const url = `${siteConfig.url}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteConfig.url}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs text-brand font-medium mb-4">
          {post.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full bg-brand/10">{t}</span>
          ))}
        </div>

        <h1 className="text-4xl font-semibold text-foreground leading-tight">{post.title}</h1>
        <p className="text-muted mt-3 text-lg leading-relaxed">{post.description}</p>
        <p className="text-sm text-muted mt-4">
          By {post.author} · {formatDate(post.date)} · {post.readingMinutes} min read
        </p>

        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-line my-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        <BlogContent body={post.body} />

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/15 to-coral/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Ready to find your look?</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Browse curated presets with live before/after previews, or start selling your own.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/browse">
              <Button size="lg">Explore Presets <ArrowRight className="h-5 w-5" /></Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" size="lg">Become a Seller</Button>
            </Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-semibold text-foreground mb-4">Keep reading</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-xl border border-line bg-surface p-5 hover:border-line-strong transition-colors"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted mt-1.5 line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
