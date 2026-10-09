/**
 * src/app/admin/login/actions.js
 * Server Actions for the admin login, logout, and password-reset flow.
 *
 * Server Actions run on the server, so the Supabase secret values never
 * leave the machine. Every mutation calls revalidatePath so the UI updates.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign the admin in.
 *
 * Called from a form with fields "email" and "password".
 * Returns { error: string } on failure, or redirects to /admin on success.
 */
export async function signIn(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // Basic checks so we can show a friendly message instead of a Supabase error.
  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Show one generic message. Don't tell attackers whether the email exists.
    return { error: "Invalid email or password." };
  }

  // Extra safety: even if a valid user signed in, make sure they are an admin.
  // Public sign-up is disabled in Supabase, but this is defense-in-depth.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }

  // We're in. Refresh cached pages so the admin header shows the user, then
  // send them to the dashboard.
  revalidatePath("/", "layout");
  redirect("/admin");
}

/**
 * Sign the admin out and return to the login page.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/**
 * Send a password-reset email.
 * The email contains a link that comes back to /admin/auth/confirm, which
 * exchanges the code for a session and lands the user on /admin/update-password.
 */
export async function requestPasswordReset(prevState, formData) {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { error: "Please enter your email address." };
  }

  const supabase = await createClient();

  // Where should the reset link send the user back to?
  // In Supabase -> Authentication -> URL Configuration, add:
  //   http://localhost:3000/admin/auth/confirm   (for local)
  //   https://yourdomain.com/admin/auth/confirm  (for production)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${siteUrl}/admin/auth/confirm?next=/admin/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    // We still show the same success message either way so we don't leak
    // whether an email is registered. Log the real error for yourself.
    console.error("Password reset error:", error.message);
  }

  // Always report success, no matter what. This is intentional.
  return {
    success:
      "If that email is registered, a reset link is on its way. Check your inbox and spam folder.",
  };
}