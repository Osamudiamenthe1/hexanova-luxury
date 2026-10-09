/**
 * src/lib/data/collections.js
 * Fetch curated collections (e.g. "Noir Collection", "Ivory Collection").
 */

import { supabasePublic } from "@/lib/supabase/public";

/**
 * Get every collection, sorted by sort_order.
 */
export async function getAllCollections() {
  const { data, error } = await supabasePublic
    .from("collections")
    .select("id, name, slug, description, cover_image_url, is_featured, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCollections error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Get only featured collections. Used on the home page.
 */
export async function getFeaturedCollections(limit = 3) {
  const { data, error } = await supabasePublic
    .from("collections")
    .select("id, name, slug, description, cover_image_url, sort_order")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getFeaturedCollections error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Get a single collection by its slug.
 */
export async function getCollectionBySlug(slug) {
  const { data, error } = await supabasePublic
    .from("collections")
    .select("id, name, slug, description, cover_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCollectionBySlug error:", error.message);
    return null;
  }

  return data;
}