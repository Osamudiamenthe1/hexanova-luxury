/**
 * src/lib/data/categories.js
 * Fetch product categories from Supabase.
 */

import { supabasePublic } from "@/lib/supabase/public";

/**
 * Get every category, sorted by sort_order.
 */
export async function getAllCategories() {
  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCategories error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Get a single category by its slug, or null if not found.
 */
export async function getCategoryBySlug(slug) {
  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug error:", error.message);
    return null;
  }

  return data;
}