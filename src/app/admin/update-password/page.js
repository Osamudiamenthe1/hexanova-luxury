/**
 * src/app/admin/update-password/page.js
 * Where the admin sets a new password after clicking the reset email.
 *
 * The /admin/auth/confirm route already exchanged the email code for a
 * valid session, so this page can safely update the password.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Set a new password - HexaNova Luxury",
  robots: { index: false, follow: false },
};

/**
 * Server Action: saves the new password.
 */
async function updatePassword(formData) {
  "use server";
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) {
    redirect("/admin/update-password?error=too_short");
  }
  if (password !== confirm) {
    redirect("/admin/update-password?error=no_match");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/admin/update-password?error=update_failed");
  }

  // Password changed. Send them to the dashboard.
  redirect("/admin");
}

export default async function UpdatePasswordPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  // Must be signed in (which the reset link just did) to reach this page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const errorMessages = {
    too_short: "Password must be at least 8 characters.",
    no_match: "The two passwords did not match.",
    update_failed: "Could not update the password. Please try again.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={updatePassword} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-heading">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a password you do not use anywhere else. Minimum 8 characters.
        </p>

        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm mb-1">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && errorMessages[error] && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessages[error]}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-accent text-accent-foreground py-2 rounded font-medium"
        >
          Save new password
        </button>
      </form>
    </div>
  );
}