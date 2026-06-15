import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'
import { getAllPosts } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/browse`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/browse?free=1`, changeFrequency: 'daily', priority: 0.8 },
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
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('presets')
      .select('id, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5000)
    presetRoutes = (data || []).map((p: { id: string; created_at: string }) => ({
      url: `${base}/preset/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    presetRoutes = []
  }

  return [...staticRoutes, ...postRoutes, ...presetRoutes]
}
