/**
 * src/lib/supabase/browser.js
 * Supabase client that runs in the BROWSER.
 *
 * We only use this for admin image uploads. Uploading from the browser
 * means we skip Next.js's request body size limit (which is 1 MB by default
 * on Vercel and would break uploading photos).
 *
 * This client must only be imported from files that start with
 * "use client" at the top.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client for the browser.
 * Call it inside a component's event handler, e.g. on file select.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}