/**
 * src/app/admin/layout.js
 * Admin shell. Fetches settings to pass the current brand name into the
 * sidebar. Does NOT call requireAdmin() - each admin page does that
 * itself (see the note in src/lib/auth.js).
 */

import AdminShell from "@/components/admin/admin-shell";
import { signOut } from "./login/actions";
import { getBrandName } from "@/lib/data/settings";

export async function generateMetadata() {
  const brandName = await getBrandName();
  return {
    title: `Admin - ${brandName}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }) {
  const brandName = await getBrandName();

  const signOutForm = (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full text-left px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground rounded-md mx-2 transition-colors duration-150"
      >
        Sign out
      </button>
    </form>
  );

  return (
    <AdminShell signOutForm={signOutForm} brandName={brandName}>
      {children}
    </AdminShell>
  );
}