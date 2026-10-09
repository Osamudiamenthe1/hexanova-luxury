/**
 * src/app/(public)/categories/[slug]/page.js
 * A single category listing. Same grid as the shop, pre-filtered by category.
 *
 * The [slug] folder name means this file handles URLs like:
 *   /categories/living
 *   /categories/dining
 *
 * The category's name and description come from Supabase, so the admin can
 * edit them without any code changes.
 */

import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/ui/product-card";
import ProductFilters from "@/components/ui/product-filters";
import Pagination from "@/components/ui/pagination";
import EmptyState from "@/components/ui/empty-state";
import { getAllCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getAllCollections } from "@/lib/data/collections";
import { getProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

/**
 * Dynamic metadata: the page title uses the category's name.
 * If the category doesn't exist, we return a plain title and the page 404s.
 */
export async function generateMetadata({ params, searchParams }) {
  // Both params and searchParams are Promises in Next.js 15.
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  // Read the current brand name so share previews stay in sync when the
  // admin renames the brand.
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";

  const hasFilters =
    search?.search ||
    search?.collection ||
    search?.minPrice ||
    search?.maxPrice ||
    search?.sort ||
    search?.page;

  return {
    title: category.name,
    description:
      category.description ||
      `Browse ${category.name.toLowerCase()} furniture from ${brandName}.`,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}

const PER_PAGE = 12;

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [categories, collections] = await Promise.all([
    getAllCategories(),
    getAllCollections(),
  ]);

  // Extra filters that can be applied on top of the category.
  const collectionSlug = search?.collection || null;
  const collectionId = collectionSlug
    ? collections.find((c) => c.slug === collectionSlug)?.id
    : undefined;

  const page = Math.max(1, parseInt(search?.page || "1", 10));
  const sort = search?.sort || "newest";

  const { products, total, totalPages } = await getProducts({
    categoryId: category.id,
    collectionId,
    minPrice: search?.minPrice || null,
    maxPrice: search?.maxPrice || null,
    search: search?.search || null,
    sort,
    page,
    perPage: PER_PAGE,
  });

  // Params to preserve across pagination links.
  const preservedParams = {};
  if (collectionSlug) preservedParams.collection = collectionSlug;
  if (search?.minPrice) preservedParams.minPrice = search.minPrice;
  if (search?.maxPrice) preservedParams.maxPrice = search.maxPrice;
  if (search?.search) preservedParams.search = search.search;
  if (sort && sort !== "newest") preservedParams.sort = sort;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Category"
        title={category.name}
        description={category.description}
        className="mb-10"
      />

      <ProductFilters
        categories={categories}
        collections={collections}
        // On this page, we hide the category dropdown (you're already in one).
        hide={["category"]}
      />

      <p className="text-sm text-muted-foreground mb-8">
        {total === 0
          ? "No products found"
          : `${total} ${total === 1 ? "product" : "products"}`}
      </p>

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
            basePath={`/categories/${category.slug}`}
            searchParams={preservedParams}
          />
        </>
      ) : (
        <EmptyState
          title="Nothing in this category yet"
          description="Check back soon, or browse the full collection."
          action={{ href: "/products", label: "See all products" }}
        />
      )}
    </Container>
  );
}