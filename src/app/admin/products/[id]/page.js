/**
 * src/app/admin/products/[id]/page.js
 * Edit a product. Two sections on one page:
 *   1. The product details form
 *   2. The image manager
 *
 * Having them together means the admin can do everything in one place.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllCategoriesAdmin } from "@/lib/data/admin";
import {
  getAllCollectionsAdmin,
  getProductByIdAdmin,
} from "@/lib/data/admin-products";
import { updateProduct } from "@/lib/actions/products";
import ProductForm from "../product-form";
import SavedBanner from "@/components/admin/saved-banner";
import ImageManager from "@/components/admin/image-manager";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const search = await searchParams;
  const saved = search?.saved;

  const product = await getProductByIdAdmin(id);
  if (!product) notFound();

  const [categories, collections] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllCollectionsAdmin(),
  ]);

  const action = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All products
        </Link>
        <h1 className="text-3xl font-heading mb-1">{product.name}</h1>
        <p className="text-sm text-muted-foreground">
          /products/{product.slug}
        </p>
      </div>

            <SavedBanner message={saved ? "Product saved." : null} />

      {/* Images section */}
      <section className="space-y-5">
        <div className="border-b border-border pb-2">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Images
          </h2>
        </div>
        <ImageManager productId={product.id} images={product.product_images} />
      </section>

      {/* Details form */}
      <section className="space-y-5">
        <div className="border-b border-border pb-2">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Details
          </h2>
        </div>
        <ProductForm
          product={product}
          categories={categories}
          collections={collections}
          action={action}
        />
      </section>
    </div>
  );
}