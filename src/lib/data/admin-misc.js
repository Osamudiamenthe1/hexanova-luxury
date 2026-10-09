/**
 * src/lib/data/admin-misc.js
 * Admin queries for collections, testimonials, and the project list.
 */

import { createClient } from "@/lib/supabase/server";

/* =========================================================================
   COLLECTIONS
   ========================================================================= */

export async function getAllCollectionsAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select(
      "id, name, slug, description, cover_image_url, is_featured, sort_order, created_at"
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCollectionsAdmin error:", error.message);
    return [];
  }
  return data || [];
}

export async function getCollectionByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, cover_image_url, is_featured, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCollectionByIdAdmin error:", error.message);
    return null;
  }
  return data;
}

/* =========================================================================
   TESTIMONIALS
   ========================================================================= */

export async function getAllTestimonialsAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select(
      "id, author_name, author_title, quote, project_id, is_visible, sort_order, created_at, projects ( title )"
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllTestimonialsAdmin error:", error.message);
    return [];
  }
  return data || [];
}

export async function getTestimonialByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_title, quote, project_id, is_visible, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getTestimonialByIdAdmin error:", error.message);
    return null;
  }
  return data;
}

/* =========================================================================
   PROJECTS (list only)
   ========================================================================= */

export async function getAllProjectsAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, slug, status, year")
    .order("year", { ascending: false });

  if (error) {
    console.error("getAllProjectsAdmin error:", error.message);
    return [];
  }
  return data || [];
}