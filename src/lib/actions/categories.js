/**
 * src/lib/actions/categories.js
 * Server Actions for category create / update / delete.
 *
 * Rules:
 *   - Every action calls requireAdmin() FIRST, so nothing runs without an
 *     admin session (middleware alone is not enough).
 *   - Every input is validated before it reaches the database.
 *   - deleteCategory refuses to delete a category that still has products
 *     assigned. This is enforced in CODE, so it works regardless of what
 *     the database's foreign key rule is set to.
 *   - After a mutation we call revalidatePath so public pages update.
 *   - redirect() is NEVER wrapped in try/catch. In Next.js it works by
 *     throwing a special error, and try/catch would swallow it.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
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
  image_url: z.string().trim().max(500).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

/**
 * Create a new category.
 */
export async function createCategory(prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Please choose a different one." };
    }
    console.error("createCategory error:", error.message);
    return { error: "Could not save the category. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories?saved=created");
}

/**
 * Update an existing category.
 */
export async function updateCategory(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Please choose a different one." };
    }
    console.error("updateCategory error:", error.message);
    return { error: "Could not save the category. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories?saved=updated");
}

/**
 * Delete a category.
 *
 * We check for products that reference this category FIRST. If any exist,
 * we refuse the delete and return a friendly message. This is deliberately
 * enforced in code, not left to the database's foreign key rule, because:
 *   - ON DELETE CASCADE would silently delete products (disaster).
 *   - ON DELETE SET NULL would silently orphan products.
 *   - ON DELETE RESTRICT would work, but means the client has to change
 *     their schema to be safe.
 * Doing it here means the behaviour is the same no matter the schema.
 */
export async function deleteCategory(id) {
  const { supabase } = await requireAdmin();

  // 1. Count products that use this category.
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    console.error("deleteCategory count error:", countError.message);
    return { error: "Could not check for linked products. Please try again." };
  }

  // 2. Refuse if any products use it.
  if (count && count > 0) {
    return {
      error: `Cannot delete this category: ${count} ${
        count === 1 ? "product is" : "products are"
      } still assigned to it. Move or delete those products first.`,
    };
  }

  // 3. Safe to delete.
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("deleteCategory error:", error.message);
    return { error: "Could not delete the category. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}