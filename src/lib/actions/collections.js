/**
 * src/lib/actions/collections.js
 * Server Actions for collection create / update / delete.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  cover_image_url: z.string().trim().max(500).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export async function createCollection(prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    cover_image_url: formData.get("cover_image_url"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    is_featured: formData.get("is_featured") === "on",
  };

  const { error } = await supabase.from("collections").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Please choose a different one." };
    }
    console.error("createCollection error:", error.message);
    return { error: "Could not save the collection. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/collections?saved=created");
}

export async function updateCollection(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    cover_image_url: formData.get("cover_image_url"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    is_featured: formData.get("is_featured") === "on",
  };

  const { error } = await supabase.from("collections").update(row).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Please choose a different one." };
    }
    console.error("updateCollection error:", error.message);
    return { error: "Could not save the collection. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/collections?saved=updated");
}

export async function deleteCollection(id) {
  const { supabase } = await requireAdmin();

  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", id);

  if (countError) {
    console.error("deleteCollection count error:", countError.message);
    return { error: "Could not check for linked products. Please try again." };
  }

  if (count && count > 0) {
    return {
      error: `Cannot delete this collection: ${count} ${
        count === 1 ? "product is" : "products are"
      } still assigned to it. Remove them from the collection first.`,
    };
  }

  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) {
    console.error("deleteCollection error:", error.message);
    return { error: "Could not delete the collection. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}