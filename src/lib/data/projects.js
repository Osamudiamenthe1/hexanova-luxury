/**
 * src/lib/data/projects.js
 * All project (portfolio) queries for the public site.
 */

import { supabasePublic } from "@/lib/supabase/public";

const PROJECT_COLUMNS = `
  id, title, slug, client_name, location, year,
  summary, description, cover_image_url, is_featured,
  project_images ( id, image_url, caption, sort_order )
`;

/**
 * Featured projects for the home page. Max 3.
 */
export async function getFeaturedProjects(limit = 3) {
  const { data, error } = await supabasePublic
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("year", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProjects error:", error.message);
    return [];
  }

  return (data || []).map(sortProjectImages);
}

/**
 * All published projects, newest first.
 */
export async function getAllProjects() {
  const { data, error } = await supabasePublic
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("status", "published")
    .order("year", { ascending: false });

  if (error) {
    console.error("getAllProjects error:", error.message);
    return [];
  }

  return (data || []).map(sortProjectImages);
}

/**
 * A single published project by slug.
 */
export async function getProjectBySlug(slug) {
  const { data, error } = await supabasePublic
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getProjectBySlug error:", error.message);
    return null;
  }

  return data ? sortProjectImages(data) : null;
}

function sortProjectImages(project) {
  if (!project) return project;
  if (Array.isArray(project.project_images)) {
    project.project_images.sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }
  return project;
}