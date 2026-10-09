/**
 * src/lib/actions/products.js
 * Server Actions for product CRUD and for managing product images.
 *
 * All actions call requireAdmin() first. Image deletion also removes the
 * underlying file from Supabase Storage, so we don't leave orphans behind.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
  short_description: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  // We accept any non-empty string. The database has a foreign key from
  // products.category_id to categories.id, so an invalid value would be
  // rejected by Postgres anyway. Zod's strict UUID check rejects our seed
  // IDs (which don't have a version digit), so we do a simple presence check
  // here instead.
  category_id: z.string().trim().min(1, "Please choose a category."),
  collection_id: z.string().trim().max(100).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price cannot be negative.").max(99999999999),
  show_price: z.coerce.boolean().default(true),
  materials: z.string().trim().max(500).optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  lead_time: z.string().trim().max(200).optional().or(z.literal("")),
  is_featured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

/**
 * Build the parsed data object from raw form values, converting our
 * checkbox values ("on" or missing) into real booleans.
 */
function parseProductForm(formData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    collection_id: formData.get("collection_id"),
    price: formData.get("price"),
    // A checked checkbox sends "on"; unchecked sends nothing.
    show_price: formData.get("show_price") === "on",
    materials: formData.get("materials"),
    dimensions: formData.get("dimensions"),
    lead_time: formData.get("lead_time"),
    is_featured: formData.get("is_featured") === "on",
    status: formData.get("status"),
  });
}

/**
 * Create a new product.
 */
export async function createProduct(prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Turn empty strings into null so the DB stores cleaner values.
  const row = {
    ...parsed.data,
    collection_id: parsed.data.collection_id || null,
    currency: "NGN",
  };

  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Choose a different one." };
    }
    console.error("createProduct error:", error.message);
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/", "layout");
  // Send the admin straight to the edit page so they can add images.
  redirect(`/admin/products/${data.id}?saved=created`);
}

/**
 * Update an existing product.
 */
export async function updateProduct(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    collection_id: parsed.data.collection_id || null,
  };

  const { error } = await supabase.from("products").update(row).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Choose a different one." };
    }
    console.error("updateProduct error:", error.message);
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=updated`);
}

/**
 * Delete a product. Also removes its images from storage.
 */
export async function deleteProduct(id) {
  const { supabase } = await requireAdmin();

  // Fetch image URLs first so we can delete them from storage.
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  // Delete image rows. Most schemas cascade this automatically, but we do
  // it explicitly so behaviour is predictable regardless of the schema.
  const { error: imgError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", id);

  if (imgError) {
    console.error("deleteProduct images error:", imgError.message);
  }

  // Delete storage files. Best-effort; a failure here shouldn't block the
  // product deletion.
  if (images && images.length > 0) {
    const marker = "/storage/v1/object/public/media/";
    const paths = images
      .map((img) => {
        const index = img.image_url.indexOf(marker);
        return index === -1 ? null : img.image_url.slice(index + marker.length);
      })
      .filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove(paths);
      if (storageError) {
        console.error("deleteProduct storage error:", storageError.message);
      }
    }
  }

  // Delete the product itself.
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("deleteProduct error:", error.message);
    return { error: "Could not delete the product. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/* =========================================================================
   IMAGE MANAGEMENT
   These actions are called from the ImageManager client component.
   The file upload itself happens in the browser (see src/lib/upload.js);
   these actions only handle the DATABASE rows.
   ========================================================================= */

/**
 * Attach an already-uploaded image to a product.
 * The client uploads the file, then calls this to save the row.
 */
export async function addProductImage(productId, imageUrl, altText = "") {
  const { supabase } = await requireAdmin();

  // Put the new image at the end of the list.
  const { data: last } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = last ? (last.sort_order ?? 0) + 1 : 0;

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: imageUrl,
    alt_text: altText || null,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("addProductImage error:", error.message);
    return { error: "Could not save the image record." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Delete an image row AND its file in storage.
 */
export async function deleteProductImage(imageId, imageUrl) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("deleteProductImage error:", error.message);
    return { error: "Could not delete the image." };
  }

  // Remove the file from storage. Best-effort.
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

/**
 * Update just the alt text of an image.
 */
export async function updateImageAlt(imageId, altText) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: altText || null })
    .eq("id", imageId);

  if (error) {
    console.error("updateImageAlt error:", error.message);
    return { error: "Could not save the alt text." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Move an image up or down by swapping sort_order with its neighbour.
 * "direction" is "up" or "down".
 */
export async function reorderProductImage(imageId, direction) {
  const { supabase } = await requireAdmin();

  // Load the target image.
  const { data: current, error: curErr } = await supabase
    .from("product_images")
    .select("id, product_id, sort_order")
    .eq("id", imageId)
    .single();

  if (curErr || !current) {
    return { error: "Could not find that image." };
  }

  // Find the neighbour we want to swap with.
  const comparison = direction === "up" ? "lt" : "gt";
  const orderDir = direction === "up" ? "desc" : "asc";

  const { data: neighbour } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", current.product_id)
    .filter("sort_order", comparison, current.sort_order)
    .order("sort_order", { ascending: direction === "down" })
    .limit(1)
    .maybeSingle();

  if (!neighbour) {
    // Already at the top or bottom. Nothing to do.
    return { success: true };
  }

  // Swap the two sort_order values. Two updates, run in parallel.
  const results = await Promise.all([
    supabase
      .from("product_images")
      .update({ sort_order: neighbour.sort_order })
      .eq("id", current.id),
    supabase
      .from("product_images")
      .update({ sort_order: current.sort_order })
      .eq("id", neighbour.id),
  ]);

  const failed = results.find((r) => r.error);
  if (failed) {
    console.error("reorderProductImage error:", failed.error.message);
    return { error: "Could not reorder. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
