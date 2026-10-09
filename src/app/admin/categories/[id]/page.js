/**
 * src/app/admin/categories/[id]/page.js
 * Edit an existing category.
 */

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCategoryByIdAdmin } from "@/lib/data/admin";
import { updateCategory } from "@/lib/actions/categories";
import CategoryForm from "../category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const category = await getCategoryByIdAdmin(id);
  if (!category) notFound();

  // Bind the id into the action so the form doesn't need to pass it.
  const action = updateCategory.bind(null, category.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">Edit category</h1>
        <p className="text-sm text-muted-foreground">
          Changes go live on the public site within a few seconds.
        </p>
      </div>

      <CategoryForm category={category} action={action} />
    </div>
  );
}