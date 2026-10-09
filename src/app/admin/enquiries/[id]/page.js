/**
 * src/app/admin/enquiries/[id]/page.js
 * Single enquiry view. Shows the full message, contact details, and the
 * linked product (if any). Lets the admin update status or delete.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Package } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getEnquiryByIdAdmin } from "@/lib/data/admin-enquiries";
import {
  deleteEnquiryAndRedirect,
  updateEnquiryStatus,
} from "@/lib/actions/enquiries";
import DeleteButton from "@/components/admin/delete-button";
import EnquiryStatusForm from "./status-form";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-NG", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EnquiryDetailPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const enquiry = await getEnquiryByIdAdmin(id);
  if (!enquiry) notFound();

  // Bind the id into both server actions.
  const statusAction = updateEnquiryStatus.bind(null, enquiry.id);
  const deleteAction = deleteEnquiryAndRedirect.bind(null, enquiry.id);

  const typeLabel =
    enquiry.type === "product"
      ? "Product enquiry"
      : enquiry.type === "consultation"
      ? "Consultation request"
      : "General enquiry";

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All enquiries
        </Link>
        <h1 className="text-3xl font-heading mb-1">{enquiry.name}</h1>
        <p className="text-sm text-muted-foreground">
          {typeLabel} &nbsp;·&nbsp; Received {formatDate(enquiry.created_at)}
        </p>
      </div>

      {/* Contact card */}
      <section className="border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Email</p>
            <a
              href={`mailto:${enquiry.email}`}
              className="text-sm link-underline hover:text-foreground transition-colors duration-200"
            >
              {enquiry.email}
            </a>
          </div>
        </div>

        {enquiry.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Phone</p>
              <a
                href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                className="text-sm link-underline hover:text-foreground transition-colors duration-200"
              >
                {enquiry.phone}
              </a>
            </div>
          </div>
        )}

        {enquiry.products && (
          <div className="flex items-start gap-3">
            <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">About product</p>
              <Link
                href={`/products/${enquiry.products.slug}`}
                target="_blank"
                className="text-sm link-underline hover:text-foreground transition-colors duration-200"
              >
                {enquiry.products.name}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Message */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Message
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
      </section>

      {/* Status */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Status
        </h2>
        <EnquiryStatusForm
          action={statusAction}
          currentStatus={enquiry.status}
        />
      </section>

      {/* Reply shortcut + delete */}
      <section className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
        <a
          href={`mailto:${enquiry.email}?subject=${encodeURIComponent("Re: your enquiry - HexaNova Luxury")}`}
          className="inline-flex items-center gap-2.5 h-11 px-6 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md transition-all duration-200"
        >
          <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reply by email
        </a>
        <DeleteButton
          action={deleteAction}
          confirmMessage={`Delete this enquiry from ${enquiry.name}? This cannot be undone.`}
        />
      </section>
    </div>
  );
}