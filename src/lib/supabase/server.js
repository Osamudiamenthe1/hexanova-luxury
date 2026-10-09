/**
 * src/lib/supabase/server.js
 * Server-side Supabase client that reads the login session from cookies.
 *
 * Use it in:
 *  - Server Components (async functions inside app/)
 *  - Server Actions ("use server" files)
 *  - Route Handlers (files named route.js inside app/)
 *
 * IMPORTANT Next.js 15 note: cookies() is ASYNC now. We must "await" it.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client bound to the current request's cookies.
 * Must be awaited: `const supabase = await createClient();`
 */
export async function createClient() {
  // In Next.js 15, cookies() returns a Promise. We await it to get the store.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Read all cookies (Supabase needs the auth ones).
        getAll() {
          return cookieStore.getAll();
        },

        // Write cookies (used when logging in, refreshing a session, or out).
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components, Next.js does not allow writing cookies.
            // That's OK - our middleware refreshes the session on every /admin
            // request, so the cookie is always up to date by the time we get here.
          }
        },
      },
    }
  );
}