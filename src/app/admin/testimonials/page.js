import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllTestimonialsAdmin } from "@/lib/data/admin-misc";
import { deleteTestimonial } from "@/lib/actions/testimonials";
import SavedBanner from "@/components/admin/saved-banner";
import DeleteButton from "@/components/admin/delete-button";
import Button from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TestimonialsListPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const saved = params?.saved;

  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading mb-1">Testimonials</h1>
          <p className="text-sm text-muted-foreground">
            Quotes from clients. Only visible ones appear on the public site.
          </p>
        </div>
        <Button href="/admin/testimonials/new" size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          New testimonial
        </Button>
      </div>

      <SavedBanner
        message={
          saved === "created"
            ? "Testimonial created."
            : saved === "updated"
              ? "Testimonial updated."
              : null
        }
      />

      {testimonials.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">No testimonials yet.</p>
          <Button href="/admin/testimonials/new">
            Create your first testimonial
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Author
                </th>
                <th className="hidden md:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Quote
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Order
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Visible
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/testimonials/${t.id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {t.author_name}
                    </Link>
                    {t.author_title && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.author_title}
                      </p>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground max-w-md">
                    <span className="line-clamp-2">{t.quote}</span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-right text-muted-foreground">
                    {t.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${
                        t.is_visible
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/testimonials/${t.id}`}
                        className="text-xs text-foreground/80 hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteTestimonial.bind(null, t.id)}
                        confirmMessage={`Delete the testimonial from "${t.author_name}"? This cannot be undone.`}
                      />
                    </div>
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
