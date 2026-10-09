/**
 * src/lib/data/admin.js
 * Admin-only queries.
 *
 * These use the COOKIE-based server client so the admin's session is
 * applied, which is required to read drafts and enquiries that the public
 * can never see.
 *
 * Every function here relies on Row Level Security in Supabase to enforce
 * that only admins get these rows. We still call requireAdmin() on every
 * admin PAGE - this file is just the data layer.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Counts for the admin dashboard.
 */
export async function getDashboardCounts() {
  const supabase = await createClient();

  const [
    productsPublished,
    productsDraft,
    projectsTotal,
    enquiriesNew,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    productsPublished: productsPublished.count || 0,
    productsDraft: productsDraft.count || 0,
    projectsTotal: projectsTotal.count || 0,
    enquiriesNew: enquiriesNew.count || 0,
  };
}

/**
 * The most recent enquiries, for the dashboard.
 */
export async function getRecentEnquiries(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "id, name, email, type, status, created_at, products ( name )"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentEnquiries error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * All categories, including any with custom ordering.
 */
export async function getAllCategoriesAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCategoriesAdmin error:", error.message);
    return [];
  }
  return data || [];
}

/**
 * A single category by id (for the edit form).
 */
export async function getCategoryByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCategoryByIdAdmin error:", error.message);
    return null;
  }
  return data;
}