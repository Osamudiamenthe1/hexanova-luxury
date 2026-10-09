/**
 * src/app/admin/products/page.js
 * Admin products list. Search + status filter + edit/delete actions.
 */

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listProductsAdmin } from "@/lib/data/admin-products";
import { deleteProduct } from "@/lib/actions/products";
import DeleteButton from "@/components/admin/delete-button";
import AdminFilterSelect from "@/components/admin/admin-filter-select";
import SavedBanner from "@/components/admin/saved-banner";
import Button from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default async function ProductsListPage({ searchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const search = params?.search || "";
  const status = params?.status || "";
  const saved = params?.saved;

  const products = await listProductsAdmin({ search, status });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading mb-1">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage the shop catalog. Products marked draft are hidden from the
            public site.
          </p>
        </div>
        <Button href="/admin/products/new" size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          New product
        </Button>
      </div>

      <SavedBanner
        message={
          saved === "created"
            ? "Product created."
            : saved === "updated"
              ? "Product updated."
              : null
        }
      />

      {/* Filter bar */}
      <form
        method="get"
        className="grid gap-3 sm:grid-cols-[1fr_200px_auto] items-end border-y border-border py-4"
      >
        <div>
          <label
            htmlFor="search"
            className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2"
          >
            Search
          </label>
          <div className="relative">
            <input
              id="search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Product name"
              className="w-full h-11 pl-10 pr-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

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

      {products.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">
            {search || status
              ? "No products match those filters."
              : "No products yet."}
          </p>
          <Button href="/admin/products/new">Create your first product</Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Product
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Price
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0 bg-muted rounded-sm overflow-hidden">
                        {product.product_images?.[0]?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.product_images[0].image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:text-accent transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        {/* Status badge shown only on mobile, where the
                            Status column is hidden. Without this, mobile
                            users can't tell a draft from a published product. */}
                        <span
                          className={`sm:hidden inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded-sm ${
                            product.status === "published"
                              ? "bg-accent/15 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground">
                    {product.categories?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {formatPrice(product.price, product.show_price)}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${
                        product.status === "published"
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs text-foreground/80 hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProduct.bind(null, product.id)}
                        confirmMessage={`Delete "${product.name}"? Its images will also be removed. This cannot be undone.`}
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
