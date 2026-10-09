/**
 * src/app/sitemap.js
 * Generates /sitemap.xml automatically. Next.js calls this at build time
 * (and on revalidation) and serves the result as XML.
 */

import { supabasePublic } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const now = new Date();

  const staticPages = [
    { url: `${siteUrl}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${siteUrl}/products`, priority: 0.9, changeFrequency: "daily" },
    { url: `${siteUrl}/projects`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${siteUrl}/services`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${siteUrl}/about`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${siteUrl}/contact`, priority: 0.6, changeFrequency: "monthly" },
  ].map((p) => ({ ...p, lastModified: now }));

  const [productsResult, projectsResult, categoriesResult, collectionsResult] =
    await Promise.all([
      supabasePublic
        .from("products")
        .select("slug, updated_at")
        .eq("status", "published"),
      supabasePublic
        .from("projects")
        .select("slug, updated_at")
        .eq("status", "published"),
      supabasePublic.from("categories").select("slug"),
      supabasePublic.from("collections").select("slug"),
    ]);

  const productUrls = (productsResult.data || []).map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectUrls = (projectsResult.data || []).map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryUrls = (categoriesResult.data || []).map((c) => ({
    url: `${siteUrl}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionUrls = (collectionsResult.data || []).map((c) => ({
    url: `${siteUrl}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...productUrls,
    ...projectUrls,
    ...categoryUrls,
    ...collectionUrls,
  ];
}