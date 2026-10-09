/**
 * src/app/(public)/products/page.js
 * The shop listing page. Shows all published products with filters,
 * sorting, and pagination.
 *
 * Filters live in the URL:
 *   /products?category=living&sort=price-asc&page=2
 *
 * Categories and collections are passed to the filter component as
 * dropdown options. They are small lists, so we load them every time.
 */

import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/ui/product-card";
import ProductFilters from "@/components/ui/product-filters";
import Pagination from "@/components/ui/pagination";
import EmptyState from "@/components/ui/empty-state";
import { getAllCategories } from "@/lib/data/categories";
import { getAllCollections } from "@/lib/data/collections";
import { getProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";

// Cache for 60 seconds.
export const revalidate = 60;

export async function generateMetadata({ searchParams }) {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";

  // Next.js 15: searchParams is a Promise.
  const params = await searchParams;

  // Any of these params makes the URL a "filtered view" of the same page.
  // We do not want Google indexing dozens of variations of the shop.
  const hasFilters =
    params?.search ||
    params?.category ||
    params?.collection ||
    params?.minPrice ||
    params?.maxPrice ||
    params?.sort ||
    params?.page;

  return {
    title: "Shop",
    description: `Browse the full collection of ${brandName} furniture. Sofas, dining tables, beds, lighting, and decor.`,
    // Canonical always points at the clean /products URL, regardless of
    // which filters are active. This tells Google "the real page is this".
    alternates: {
      canonical: "/products",
    },
    // Filtered views: keep out of the index, but still let the crawler
    // follow the links through to product pages.
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}
const PER_PAGE = 12;

export default async function ProductsPage({ searchParams }) {
  // In Next.js 15, searchParams is a Promise.
  const params = await searchParams;

  const settings = await getSettings();
  const city = settings.city || "Nigeria";

  // Read filters out of the URL. All optional.
  const categorySlug = params?.category || null;
  const collectionSlug = params?.collection || null;
  const minPrice = params?.minPrice || null;
  const maxPrice = params?.maxPrice || null;
  const search = params?.search || null;
  const sort = params?.sort || "newest";
  const page = Math.max(1, parseInt(params?.page || "1", 10));

  // Load categories and collections for the dropdowns.
  const [categories, collections] = await Promise.all([
    getAllCategories(),
    getAllCollections(),
  ]);

  // Translate slug filters to IDs so the products query can use them.
  const categoryId = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.id
    : undefined;
  const collectionId = collectionSlug
    ? collections.find((c) => c.slug === collectionSlug)?.id
    : undefined;

  const { products, total, totalPages } = await getProducts({
    categoryId,
    collectionId,
    minPrice,
    maxPrice,
    search,
    sort,
    page,
    perPage: PER_PAGE,
  });

  // Build search params object to preserve across pagination links.
  const preservedParams = {};
  if (categorySlug) preservedParams.category = categorySlug;
  if (collectionSlug) preservedParams.collection = collectionSlug;
  if (minPrice) preservedParams.minPrice = minPrice;
  if (maxPrice) preservedParams.maxPrice = maxPrice;
  if (search) preservedParams.search = search;
  if (sort && sort !== "newest") preservedParams.sort = sort;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Shop"
        title="Furniture"
        description={`Every piece is made in our ${city} workshop. Prices are in naira. Enquire for bespoke options, finishes, and lead times.`}
        className="mb-10"
      />

      <ProductFilters categories={categories} collections={collections} />

      {/* Result count */}
      <p className="text-sm text-muted-foreground mb-8">
        {total === 0
          ? "No products found"
          : `${total} ${total === 1 ? "product" : "products"}`}
      </p>

      {/* Grid or empty state */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/products"
            searchParams={preservedParams}
          />
        </>
      ) : (
        <EmptyState
          title="Nothing matches those filters"
          description="Try widening the price range, or clearing the filters to see everything."
          action={{ href: "/products", label: "Clear all filters" }}
        />
      )}
    </Container>
  );
}
