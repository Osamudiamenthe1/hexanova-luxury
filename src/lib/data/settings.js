/**
 * src/lib/data/settings.js
 * Fetch the site_settings key/value rows from Supabase.
 *
 * Wrapped in React's cache() so that multiple components within a single
 * request share the same query result. This matters because the layout
 * AND the page AND nested components may all need the brand name - without
 * cache, each would hit the database separately.
 *
 * cache() resets between requests, so a settings change is picked up on
 * the next request (well within our 60 second revalidation window).
 */

import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";

export const getSettings = cache(async () => {
  const { data, error } = await supabasePublic
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("getSettings error:", error.message);
    return {};
  }

  return Object.fromEntries((data || []).map((row) => [row.key, row.value]));
});

/**
 * Convenience helper that always returns a usable brand name, even if
 * the setting hasn't been saved yet. Use this everywhere you'd otherwise
 * fall back to a hardcoded name.
 */
export async function getBrandName() {
  const settings = await getSettings();
  return settings.brand_name || "HexaNova Luxury";
}