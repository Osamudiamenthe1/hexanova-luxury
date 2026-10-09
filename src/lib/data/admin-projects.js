/**
 * src/lib/data/admin-projects.js
 * Admin queries for projects, project gallery images, and the products
 * linked to each project.
 */

import { createClient } from "@/lib/supabase/server";

export async function listProjectsAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, slug, location, year, status, is_featured, cover_image_url, created_at")
    .order("year", { ascending: false });

  if (error) {
    console.error("listProjectsAdmin error:", error.message);
    return [];
  }
  return data || [];
}

export async function getProjectByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id, title, slug, client_name, location, year,
      summary, description, cover_image_url, is_featured, status,
      project_images ( id, image_url, caption, sort_order )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProjectByIdAdmin error:", error.message);
    return null;
  }

  if (data && Array.isArray(data.project_images)) {
    data.project_images.sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }

  return data;
}

/**
 * All published + draft products, for the multi-select on a project.
 * We show drafts too so the admin can link a project to a product that
 * isn't yet on the public site.
 */
export async function getAllProductsForSelect() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, status")
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllProductsForSelect error:", error.message);
    return [];
  }
  return data || [];
}

/**
 * The IDs of products currently linked to a project.
 */
export async function getLinkedProductIds(projectId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_products")
    .select("product_id")
    .eq("project_id", projectId);

  if (error) {
    console.error("getLinkedProductIds error:", error.message);
    return [];
  }
  return (data || []).map((row) => row.product_id);
}