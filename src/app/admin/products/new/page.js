/**
 * src/app/admin/products/new/page.js
 * Create a new product.
 */

import { requireAdmin } from "@/lib/auth";
import { getAllCategoriesAdmin } from "@/lib/data/admin";
import { getAllCollectionsAdmin } from "@/lib/data/admin-products";
import { createProduct } from "@/lib/actions/products";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, collections] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllCollectionsAdmin(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">New product</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details, then save. You&apos;ll be able to add images
          on the next screen.
        </p>
      </div>

      <ProductForm
        categories={categories}
        collections={collections}
        action={createProduct}
      />
    </div>
  );
}