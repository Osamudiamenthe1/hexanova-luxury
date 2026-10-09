/**
 * src/app/admin/enquiries/page.js
 * The enquiry inbox. Table with a status filter.
 */

import Link from "next/link";
import { Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listEnquiriesAdmin } from "@/lib/data/admin-enquiries";
import SavedBanner from "@/components/admin/saved-banner";
import AdminFilterSelect from "@/components/admin/admin-filter-select";
import Button from "@/components/ui/button";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status) {
  if (status === "new") return "bg-accent/15 text-accent";
  if (status === "contacted")
    return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

export default async function EnquiriesListPage({ searchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const status = params?.status || "";
  const deleted = params?.deleted;

  const enquiries = await listEnquiriesAdmin({ status });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">Enquiries</h1>
        <p className="text-sm text-muted-foreground">
          Messages from the public enquiry form. Newest first.
        </p>
      </div>

            <SavedBanner message={deleted ? "Enquiry deleted." : null} />
      {/* Filter */}
      <form
        method="get"
        className="grid gap-3 sm:grid-cols-[200px_auto] items-end border-y border-border py-4"
      >
        <div>
          <label
            htmlFor="status"
            className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2"
          >
            Status
          </label>
          <AdminFilterSelect
            id="status"
            name="status"
            defaultValue={status}
            options={STATUS_OPTIONS}
          />
        </div>
        <Button type="submit" size="md">
          Apply
        </Button>
      </form>

      {/* Table */}
      {enquiries.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <Inbox
            className="h-8 w-8 mx-auto text-muted-foreground mb-4"
            strokeWidth={1.5}
          />
          <p className="text-muted-foreground mb-2">
            {status ? `No ${status} enquiries.` : "No enquiries yet."}
          </p>
          <p className="text-xs text-muted-foreground">
            Messages submitted through the contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  From
                </th>
                <th className="hidden md:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  About
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Status
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Received
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="block"
                    >
                      <p className="font-medium hover:text-accent transition-colors">
                        {enquiry.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                        {enquiry.email}
                      </p>
                      {/* Mobile-only status pill */}
                      <span
                        className={`sm:hidden inline-block mt-1.5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded-sm ${statusBadgeClass(enquiry.status)}`}
                      >
                        {enquiry.status}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                    {enquiry.products?.name ? (
                      <span>Product: {enquiry.products.name}</span>
                    ) : enquiry.type === "consultation" ? (
                      "Consultation"
                    ) : (
                      "General"
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${statusBadgeClass(enquiry.status)}`}
                    >
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {formatDate(enquiry.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
