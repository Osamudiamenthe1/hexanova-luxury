/**
 * src/app/admin/login/page.js
 * Login page. Reads brand_name from settings so the heading matches.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandName } from "@/lib/data/settings";
import LoginForm from "./login-form";

export async function generateMetadata() {
  const brandName = await getBrandName();
  return {
    title: `Admin sign in - ${brandName}`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const errorParam = params?.error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin === true) {
      redirect("/admin");
    }
  }

  const brandName = await getBrandName();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-heading mb-1">{brandName}</h1>
        <p className="text-sm text-muted-foreground mb-6">Admin sign in</p>

        {errorParam === "not_admin" && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            That account is signed in but does not have admin access.
          </p>
        )}

        <LoginForm />
      </div>
    </div>
  );
}