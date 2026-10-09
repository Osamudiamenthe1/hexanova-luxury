/**
 * src/lib/actions/settings.js
 * Server Action that updates all site settings at once.
 *
 * site_settings is a key-value table. We upsert each key so new keys can
 * be added without a schema change.
 */

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

// Every key we allow editing. Adding a new one here is all that's needed -
// the form and the save logic are both driven from this list.
const SETTINGS_KEYS = [
  "brand_name",
  "tagline",
  "hero_headline",
  "hero_subheadline",
  "hero_image_url",
  "about_title",
  "about_body",
  "about_image_url",
  "address",
  "city",
  "service_areas",
  "opening_hours",
  "phone",
  "email",
  "whatsapp_number",
  "instagram_url",
  "facebook_url",
];

// Loose validation: nothing is required, but strings have sensible max
// lengths and URLs must look like URLs (or be empty).
const settingsSchema = z.record(z.string(), z.string().max(5000));

export async function updateSettings(prevState, formData) {
  const { supabase } = await requireAdmin();

  // Collect only the keys we allow.
  const raw = {};
  for (const key of SETTINGS_KEYS) {
    raw[key] = String(formData.get(key) || "");
  }

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Prepare rows for upsert. updated_at is set server-side so the row
  // reflects when it was saved.
  const now = new Date().toISOString();
  const rows = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    updated_at: now,
  }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    console.error("updateSettings error:", error.message);
    return { error: "Could not save settings. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Settings saved." };
}