/**
 * src/app/admin/page.js
 * The admin dashboard: real counts from the database plus the most
 * recent enquiries.
 */

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDashboardCounts, getRecentEnquiries } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();

  const [counts, recent] = await Promise.all([
    getDashboardCounts(),
    getRecentEnquiries(5),
  ]);

  const cards = [
    {
      label: "Published products",
      value: counts.productsPublished,
      href: "/admin/products?status=published",
    },
    {
      label: "Draft products",
      value: counts.productsDraft,
      href: "/admin/products?status=draft",
    },
    {
      label: "Projects",
      value: counts.projectsTotal,
      href: "/admin/projects",
    },
    {
      label: "New enquiries",
      value: counts.enquiriesNew,
      href: "/admin/enquiries?status=new",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-heading mb-2">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user.email}</span>.
        </p>
      </div>

      {/* Count cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-border rounded-lg p-6 bg-card/40 hover:bg-card/70 transition-colors duration-200"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              {c.label}
            </p>
            <p className="font-heading text-4xl">{c.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-lg">Recent enquiries</h2>
          <Link
            href="/admin/enquiries"
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">
            No enquiries yet. They&apos;ll show up here as soon as visitors
            submit the contact form.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((enquiry) => (
              <li key={enquiry.id}>
                <Link
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 hover:bg-muted/30 transition-colors duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {enquiry.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        &lt;{enquiry.email}&gt;
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {enquiry.products?.name
                        ? `About: ${enquiry.products.name}`
                        : enquiry.type === "consultation"
                        ? "Consultation request"
                        : "General enquiry"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span
                      className={`inline-block px-2 py-1 rounded-sm uppercase tracking-wider ${
                        enquiry.status === "new"
                          ? "bg-accent/15 text-accent"
                          : enquiry.status === "contacted"
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {enquiry.status}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(enquiry.created_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}