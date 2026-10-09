/**
 * src/lib/supabase/public.js
 * Cookie-less Supabase client for PUBLIC, read-only pages.
 *
 * Why separate from server.js? Because public pages (home, /products, etc.)
 * can be cached by Next.js. Reading cookies would opt those pages out of
 * caching. This client never touches cookies, so the pages stay fast.
 *
 * Security: this uses the "anon" key. Row Level Security on your database
 * is what actually stops anyone reading private data with it.
 */

import { createClient } from "@supabase/supabase-js";

// Read the values from .env.local. These are public (NEXT_PUBLIC_) so it is
// safe for the browser to see them too.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A friendly early error beats a confusing one later.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Check your .env.local file and restart the dev server."
  );
}

// Create the client ONCE and export it. Reusing the same client means we
// don't open a new connection on every request.
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This client is for reading public data only - it never signs in.
    // Turning off session persistence keeps it truly cookie-free.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});