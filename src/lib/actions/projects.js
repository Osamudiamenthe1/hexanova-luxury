/**
 * src/lib/actions/projects.js
 * Server Actions for project CRUD, cover image, gallery images, and the
 * many-to-many link between projects and products.
 *
 * Every action calls requireAdmin() first.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),
  client_name: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")),
  summary: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  cover_image_url: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

function parseProjectForm(formData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    client_name: formData.get("client_name"),
    location: formData.get("location"),
    year: formData.get("year"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    cover_image_url: formData.get("cover_image_url"),
    status: formData.get("status"),
  });
}

export async function createProject(prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    year: parsed.data.year || null,
    cover_image_url: parsed.data.cover_image_url || null,
    is_featured: formData.get("is_featured") === "on",
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Choose a different one." };
    }
    console.error("createProject error:", error.message);
    return { error: "Could not save the project. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${data.id}?saved=created`);
}

export async function updateProject(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    year: parsed.data.year || null,
    cover_image_url: parsed.data.cover_image_url || null,
    is_featured: formData.get("is_featured") === "on",
  };

  const { error } = await supabase.from("projects").update(row).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Choose a different one." };
    }
    console.error("updateProject error:", error.message);
    return { error: "Could not save the project. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${id}?saved=updated`);
}

/**
 * Delete a project.
 *
 * We clean up EVERYTHING associated with the project from Storage:
 *   1. The cover image (projects.cover_image_url)
 *   2. All gallery images (project_images.image_url)
 *
 * Both are deleted from the "media" bucket before the row is removed.
 * Without this, deleting a project would leave orphaned files in Storage.
 */
export async function deleteProject(id) {
  const { supabase } = await requireAdmin();

  // Fetch the cover URL and all gallery URLs in parallel, BEFORE deleting
  // anything. Once the rows are gone we have no way to find the files.
  const [projectResult, imagesResult] = await Promise.all([
    supabase
      .from("projects")
      .select("cover_image_url")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("project_images")
      .select("image_url")
      .eq("project_id", id),
  ]);

  const coverUrl = projectResult.data?.cover_image_url || null;
  const galleryUrls = (imagesResult.data || []).map((r) => r.image_url);

  // Build one list of everything we need to remove from Storage.
  // .filter(Boolean) drops any null/empty entries.
  const allUrls = [coverUrl, ...galleryUrls].filter(Boolean);

  // Delete child rows first (gallery + product links). Some schemas
  // cascade this automatically, but we do it explicitly so behaviour
  // is predictable regardless of the schema.
  await supabase.from("project_images").delete().eq("project_id", id);
  await supabase.from("project_products").delete().eq("project_id", id);

  // Delete storage files. Best-effort - a failure here shouldn't block
  // the row deletion, or the admin would be stuck unable to remove a
  // project just because a file was already gone.
  if (allUrls.length > 0) {
    const marker = "/storage/v1/object/public/media/";
    const paths = allUrls
      .map((url) => {
        const index = url.indexOf(marker);
        return index === -1 ? null : url.slice(index + marker.length);
      })
      .filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove(paths);
      if (storageError) {
        console.error("deleteProject storage error:", storageError.message);
      }
    }
  }

  // Finally, delete the project row itself.
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("deleteProject error:", error.message);
    return { error: "Could not delete the project. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/* =========================================================================
   GALLERY IMAGES (project_images table)
   ========================================================================= */

export async function addProjectImage(projectId, imageUrl, caption = "") {
  const { supabase } = await requireAdmin();

  const { data: last } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = last ? (last.sort_order ?? 0) + 1 : 0;

  const { error } = await supabase.from("project_images").insert({
    project_id: projectId,
    image_url: imageUrl,
    caption: caption || null,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("addProjectImage error:", error.message);
    return { error: "Could not save the image." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProjectImage(imageId, imageUrl) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("deleteProjectImage error:", error.message);
    return { error: "Could not delete the image." };
  }

  if (imageUrl) {
    const marker = "/storage/v1/object/public/media/";
    const index = imageUrl.indexOf(marker);
    if (index !== -1) {
      const path = imageUrl.slice(index + marker.length);
      await supabase.storage.from("media").remove([path]);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateProjectImageCaption(imageId, caption) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("project_images")
    .update({ caption: caption || null })
    .eq("id", imageId);

  if (error) {
    console.error("updateProjectImageCaption error:", error.message);
    return { error: "Could not save the caption." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function reorderProjectImage(imageId, direction) {
  const { supabase } = await requireAdmin();

  const { data: current, error: curErr } = await supabase
    .from("project_images")
    .select("id, project_id, sort_order")
    .eq("id", imageId)
    .single();

  if (curErr || !current) {
    return { error: "Could not find that image." };
  }

  const comparison = direction === "up" ? "lt" : "gt";

  const { data: neighbour } = await supabase
    .from("project_images")
    .select("id, sort_order")
    .eq("project_id", current.project_id)
    .filter("sort_order", comparison, current.sort_order)
    .order("sort_order", { ascending: direction === "down" })
    .limit(1)
    .maybeSingle();

  if (!neighbour) {
    return { success: true };
  }

  const results = await Promise.all([
    supabase
      .from("project_images")
      .update({ sort_order: neighbour.sort_order })
      .eq("id", current.id),
    supabase
      .from("project_images")
      .update({ sort_order: current.sort_order })
      .eq("id", neighbour.id),
  ]);

  const failed = results.find((r) => r.error);
  if (failed) {
    console.error("reorderProjectImage error:", failed.error.message);
    return { error: "Could not reorder. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/* =========================================================================
   PROJECT <-> PRODUCT LINKS (project_products join table)
   ========================================================================= */

/**
 * Replace the full set of products linked to a project.
 * Called from a server action bound to the product-multi-select form.
 * We delete all existing links and insert the new set - simple and clear.
 */
export async function setProjectProducts(projectId, prevState, formData) {
  const { supabase } = await requireAdmin();

  // getAll() returns all values for a given field name (checkboxes).
  const productIds = formData.getAll("product_ids").filter(Boolean);

  const { error: delError } = await supabase
    .from("project_products")
    .delete()
    .eq("project_id", projectId);

  if (delError) {
    console.error("setProjectProducts delete error:", delError.message);
    return { error: "Could not update the product links. Please try again." };
  }

  if (productIds.length > 0) {
    const rows = productIds.map((productId) => ({
      project_id: projectId,
      product_id: productId,
    }));

    const { error: insError } = await supabase
      .from("project_products")
      .insert(rows);

    if (insError) {
      console.error("setProjectProducts insert error:", insError.message);
      return { error: "Could not save the product links. Please try again." };
    }
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Product links saved." };
}