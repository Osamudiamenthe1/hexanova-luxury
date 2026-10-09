/**
 * src/lib/data/admin-products.js
 * Admin-only queries for products and their images.
 *
 * Unlike the public queries, these use the cookie-based server client so
 * the admin session is applied and drafts are visible.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * List products with optional search and status filter.
 */
export async function listProductsAdmin({ search, status } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      id, name, slug, price, show_price, status, is_featured, created_at,
      categories ( id, name ),
      product_images ( id, image_url, sort_order )
    `
    )
    .order("created_at", { ascending: false });

  if (status && (status === "draft" || status === "published")) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listProductsAdmin error:", error.message);
    return [];
  }

  // Sort each product's images so the first one is the primary image.
  return (data || []).map((p) => ({
    ...p,
    product_images: (p.product_images || []).sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    ),
  }));
}

/**
 * A single product with everything needed for the edit form, including
 * all images sorted by sort_order.
 */
export async function getProductByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, short_description, description,
      price, show_price, currency, materials, dimensions, lead_time,
      is_featured, status, category_id, collection_id,
      product_images ( id, image_url, alt_text, sort_order )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProductByIdAdmin error:", error.message);
    return null;
  }

  if (data && Array.isArray(data.product_images)) {
    data.product_images.sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }

  return data;
}

/**
 * All collections for the product form's dropdown.
 */
export async function getAllCollectionsAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCollectionsAdmin error:", error.message);
    return [];
  }
  return data || [];
}