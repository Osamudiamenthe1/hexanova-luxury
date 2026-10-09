/**
 * src/app/admin/categories/new/page.js
 * Create a new category.
 */

import { requireAdmin } from "@/lib/auth";
import { createCategory } from "@/lib/actions/categories";
import CategoryForm from "../category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">New category</h1>
        <p className="text-sm text-muted-foreground">
          A category groups products by room or type, e.g. Living, Dining,
          Bedroom, Lighting.
        </p>
      </div>

      <CategoryForm action={createCategory} />
    </div>
  );
}