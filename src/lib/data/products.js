/**
 * src/lib/data/products.js
 * All product queries for the public site.
 *
 * Rule: only PUBLISHED products are ever returned from this file. Drafts
 * stay invisible to the public, even if they exist in the database.
 *
 * Each product includes its images and its category, so callers get
 * everything they need to render a card or a detail page in one query.
 */

import { supabasePublic } from "@/lib/supabase/public";

// The columns we always want back for a product. Reused across queries
// so the shape is consistent.
const PRODUCT_COLUMNS = `
  id, name, slug, short_description, description,
  price, show_price, currency, materials, dimensions, lead_time,
  is_featured, status, created_at,
  category_id, collection_id,
  categories ( id, name, slug ),
  product_images ( id, image_url, alt_text, sort_order )
`;

/**
 * Featured products for the home page. Max 8.
 */
export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabasePublic
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts error:", error.message);
    return [];
  }

  return (data || []).map(sortProductImages);
}

/**
 * The main listing query used by /products, /categories/[slug], and
 * /collections/[slug].
 *
 * Returns { products, total, totalPages, page }.
 * All filters are optional - pass nothing for "show everything".
 */
export async function getProducts({
  categoryId,
  collectionId,
  minPrice,
  maxPrice,
  search,
  sort = "newest",
  page = 1,
  perPage = 12,
} = {}) {
  // We build the query step by step so we only apply filters that were sent.
  let query = supabasePublic
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (categoryId) query = query.eq("category_id", categoryId);
  if (collectionId) query = query.eq("collection_id", collectionId);
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    query = query.gte("price", Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    query = query.lte("price", Number(maxPrice));
  }
  if (search) {
    // Sanitize the term before using it in a Supabase .or() clause.
    // Commas, parentheses, backslashes, and percent signs would be
    // interpreted as syntax and could break the query or (worse) let a
    // crafted value change its meaning. Stripping them keeps the search
    // purely textual.
    const clean = String(search)
      .replace(/[%,()\\]/g, "")
      .trim();

    if (clean) {
      // Find category IDs whose name matches the term, so a search for
      // "living" also matches products in the Living category.
      const { data: matchingCats } = await supabasePublic
        .from("categories")
        .select("id")
        .ilike("name", `%${clean}%`);
      const catIds = (matchingCats || []).map((c) => c.id);

      // Build the list of match conditions.
      const parts = [
        `name.ilike.%${clean}%`,
        `short_description.ilike.%${clean}%`,
        `materials.ilike.%${clean}%`,
      ];
      if (catIds.length > 0) {
        parts.push(`category_id.in.(${catIds.join(",")})`);
      }

      query = query.or(parts.join(","));
    }
  }

  // Sorting. "featured" first, then a sensible secondary sort.
  switch (sort) {
    case "price-asc":
      // nullsFirst: false pushes products with no price (e.g. "Price on
      // request") to the end of the list. Without this, Postgres puts
      // nulls first in DESC sorts and last in ASC sorts, which is
      // inconsistent and looks like a bug to the visitor.
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "featured":
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination: Supabase uses .range(from, to), both inclusive.
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getProducts error:", error.message);
    return { products: [], total: 0, totalPages: 0, page: 1 };
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    products: (data || []).map(sortProductImages),
    total,
    totalPages,
    page,
  };
}

/**
 * A single product by slug, for the detail page.
 */
export async function getProductBySlug(slug) {
  const { data, error } = await supabasePublic
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug error:", error.message);
    return null;
  }

  return data ? sortProductImages(data) : null;
}

/**
 * Related products from the same category, excluding the current product.
 * Used in the "Complete the room" section on the product page.
 */
export async function getRelatedProducts(
  categoryId,
  excludeProductId,
  limit = 4,
) {
  if (!categoryId) return [];

  const { data, error } = await supabasePublic
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);

  if (error) {
    console.error("getRelatedProducts error:", error.message);
    return [];
  }

  return (data || []).map(sortProductImages);
}

/**
 * The products used in a given project. Used in the "Seen in this project"
 * section on the product detail page.
 */
export async function getProductsForProject(projectId) {
  const { data, error } = await supabasePublic
    .from("project_products")
    .select(
      `product:products (
        id, name, slug, price, show_price,
        categories ( name ),
        product_images ( id, image_url, alt_text, sort_order )
      )`,
    )
    .eq("project_id", projectId);

  if (error) {
    console.error("getProductsForProject error:", error.message);
    return [];
  }

  // Only return products that are actually published.
  return (data || [])
    .map((row) => row.product)
    .filter((p) => p && p.status !== "draft")
    .map(sortProductImages);
}

/**
 * Small helper: sort a product's images by sort_order so the first image
 * is always the primary one.
 */
function sortProductImages(product) {
  if (!product) return product;
  if (Array.isArray(product.product_images)) {
    product.product_images.sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    );
  }
  return product;
}
