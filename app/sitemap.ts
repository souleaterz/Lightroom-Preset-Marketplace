import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'
import { getAllPosts } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'
import { toCategoryList } from '@/lib/categories'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/browse`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/free-lightroom-presets`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sell`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/affiliates`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  let presetRoutes: MetadataRoute.Sitemap = []
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('presets')
      .select('id, created_at, category')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5000)
    const rows = (data || []) as { id: string; created_at: string; category: string | null }[]
    presetRoutes = rows.map((p) => ({
      url: `${base}/preset/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    // Category landing pages — only those that actually have presets.
    categoryRoutes = toCategoryList(rows.map((p) => p.category)).map((c) => ({
      url: `${base}/presets/${c.value}`,
      changeFrequency: 'daily',
      priority: 0.8,
    }))
  } catch {
    presetRoutes = []
    categoryRoutes = []
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...presetRoutes]
}
