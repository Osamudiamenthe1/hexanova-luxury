/**
 * src/app/admin/categories/page.js
 * List all categories with edit and delete actions.
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllCategoriesAdmin } from "@/lib/data/admin";
import { deleteCategory } from "@/lib/actions/categories";
import DeleteButton from "@/components/admin/delete-button";
import SavedBanner from "@/components/admin/saved-banner";
import Button from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CategoriesListPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const saved = params?.saved;

  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Group products by room or type. Sort order controls how they appear
            on the public site.
          </p>
        </div>
        <Button href="/admin/categories/new" size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          New category
        </Button>
      </div>

      {/* Saved banner */}
      <SavedBanner
        message={
          saved === "created"
            ? "Category created."
            : saved === "updated"
              ? "Category updated."
              : null
        }
      />

      {/* Table */}
      {categories.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">No categories yet.</p>
          <Button href="/admin/categories/new">
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-xs uppercase tracking-widest text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 font-normal text-xs uppercase tracking-widest text-muted-foreground">
                  Slug
                </th>
                <th className="px-4 py-3 font-normal text-xs uppercase tracking-widest text-muted-foreground text-right">
                  Order
                </th>
                <th className="px-4 py-3 font-normal text-xs uppercase tracking-widest text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.slug}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {category.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="text-xs text-foreground/80 hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCategory.bind(null, category.id)}
                        confirmMessage={`Delete "${category.name}"? This cannot be undone.`}
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
