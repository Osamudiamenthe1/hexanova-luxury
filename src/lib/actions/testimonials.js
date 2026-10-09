/**
 * src/lib/actions/testimonials.js
 * Server Actions for testimonial create / update / delete.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const testimonialSchema = z.object({
  author_name: z.string().trim().min(1, "Name is required.").max(120),
  author_title: z.string().trim().max(200).optional().or(z.literal("")),
  quote: z
    .string()
    .trim()
    .min(5, "The quote is a bit short.")
    .max(1000, "The quote is too long."),
  project_id: z.string().trim().max(100).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export async function createTestimonial(prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = testimonialSchema.safeParse({
    author_name: formData.get("author_name"),
    author_title: formData.get("author_title"),
    quote: formData.get("quote"),
    project_id: formData.get("project_id"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    project_id: parsed.data.project_id || null,
    is_visible: formData.get("is_visible") === "on",
  };

  const { error } = await supabase.from("testimonials").insert(row);

  if (error) {
    console.error("createTestimonial error:", error.message);
    return { error: "Could not save the testimonial. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/testimonials?saved=created");
}

export async function updateTestimonial(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const parsed = testimonialSchema.safeParse({
    author_name: formData.get("author_name"),
    author_title: formData.get("author_title"),
    quote: formData.get("quote"),
    project_id: formData.get("project_id"),
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    project_id: parsed.data.project_id || null,
    is_visible: formData.get("is_visible") === "on",
  };

  const { error } = await supabase
    .from("testimonials")
    .update(row)
    .eq("id", id);

  if (error) {
    console.error("updateTestimonial error:", error.message);
    return { error: "Could not save the testimonial. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/testimonials?saved=updated");
}

export async function deleteTestimonial(id) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    console.error("deleteTestimonial error:", error.message);
    return { error: "Could not delete the testimonial. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}