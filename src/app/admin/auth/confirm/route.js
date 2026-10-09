/**
 * src/app/admin/auth/confirm/route.js
 * Handles the link Supabase sends in the password-reset email.
 *
 * Flow:
 *  1. User clicks the emailed link -> lands here with a code query parameter.
 *  2. We exchange that for a real login session.
 *  3. We redirect the user to /admin/update-password where they set a new password.
 *
 * Based on the official Supabase SSR docs for Next.js.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase sends one of these depending on the email template:
  //  - "code"       (PKCE flow, default for resetPasswordForEmail)
  //  - "token_hash" (older email templates)
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "recovery";

  // Where do we send the user after a successful exchange?
  // Default to the "set new password" page.
  const next = searchParams.get("next") || "/admin/update-password";
  // Safety: only allow same-site paths, never an absolute URL from the query
  // string. Otherwise an attacker could trick a user into redirecting away.
  const safeNext = next.startsWith("/") ? next : "/admin/update-password";

  const supabase = await createClient();

  // Exchange "code" (the modern flow).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("Auth confirm (code) error:", error.message);
  }

  // Exchange "token_hash" (older templates).
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("Auth confirm (token_hash) error:", error.message);
  }

  // If we get here, something went wrong. Send them to a friendly error page.
  return NextResponse.redirect(
    `${origin}/admin/login?error=auth_confirm_failed`
  );
}