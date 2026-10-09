/**
 * src/lib/auth.js
 * Server-side helpers for protecting admin pages and actions.
 *
 * requireAdmin() is the REAL security check. Middleware is only a speed bump.
 * Every admin page and every admin server action must call this function.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensure the current visitor is a signed-in admin.
 *
 * Returns { supabase, user } on success so you can keep using them.
 * Otherwise it redirects to the login page (or signs the user out if they
 * are signed in but not an admin).
 *
 * Usage at the top of any admin page or action:
 *
 *   const { supabase, user } = await requireAdmin();
 */
export async function requireAdmin() {
  const supabase = await createClient();

  // getUser() calls Supabase and validates the token. Do not use getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in at all.
    redirect("/admin/login");
  }

  // Ask the database: "is this user in the admin_users table?"
  // The is_admin() function in your Supabase project returns true/false.
  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    // Signed in, but NOT an admin. Sign them out and send them away.
    // Since public sign-up is disabled, this should never happen - but this
    // check protects us if that policy ever changes.
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  // All good. Hand back the client and user so callers can reuse them.
  return { supabase, user };
}