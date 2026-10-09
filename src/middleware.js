/**
 * src/middleware.js
 * Runs before every /admin request. Two jobs:
 *   1. Refresh the Supabase login session so it doesn't time out.
 *   2. Bounce unauthenticated visitors to the login page.
 *
 * This file lives INSIDE src/ because we used --src-dir when creating the app.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // Start with a plain "let it through" response. We might replace it below.
  let response = NextResponse.next({ request });

  // Build a minimal Supabase client that reads/writes cookies on this request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Read cookies from the incoming request.
        getAll() {
          return request.cookies.getAll();
        },

        // Write refreshed cookies onto both the request AND the response,
        // so the rest of this request sees the fresh session too.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() actually talks to Supabase to verify the session.
  // Never use getSession() for security - it only reads a cookie and can be faked.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public admin pages don't need a session (you can't log in if you're
  // already redirected away from the login page!).
  const isPublicAdminPath =
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/auth") ||
    path.startsWith("/admin/update-password");

  // If the visitor is trying to see a protected admin page without a session,
  // send them to the login page. Remember where they were going so we can
  // send them there after login (optional but nice).
  if (path.startsWith("/admin") && !isPublicAdminPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

// Only run middleware for /admin routes. This keeps it out of the way for
// public pages, which are cached and should stay fast.
// The "*" below means "anything after /admin/".
export const config = {
  matcher: ["/admin/:path*"],
};