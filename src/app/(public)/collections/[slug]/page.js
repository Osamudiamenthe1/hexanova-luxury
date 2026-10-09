/**
 * src/app/(public)/collections/[slug]/page.js
 * A single collection page (e.g. "Noir Collection").
 *
 * Layout: a full-width cover image with the collection name overlaid,
 * then the collection's description, then a grid of its products.
 */

import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import ProductCard from "@/components/ui/product-card";
import EmptyState from "@/components/ui/empty-state";
import PlaceholderImage from "@/components/ui/placeholder-image";
import { getCollectionBySlug } from "@/lib/data/collections";
import { getProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;
  const collection = await getCollectionBySlug(slug);

  if (!collection) return { title: "Collection not found" };

  // Read the current brand name so share previews stay in sync when the
  // admin renames the brand.
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";

  const hasQuery = Object.keys(search || {}).length > 0;

  return {
    title: collection.name,
    description:
      collection.description ||
      `The ${collection.name} from ${brandName}.`,
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
    ...(hasQuery ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Fetch every published product in this collection.
  // We pass a high perPage because collections are curated and small.
  const { products } = await getProducts({
    collectionId: collection.id,
    sort: "featured",
    perPage: 48,
  });

  return (
    <>
      {/* Cover */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-muted">
          {collection.cover_image_url ? (
            <Image
              src={collection.cover_image_url}
              alt={collection.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage label={collection.name} aspect="aspect-auto h-full" />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"
          />

          <div className="absolute inset-0 flex items-end">
            <Container className="pb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-4">
                Collection
              </p>
              <h1 className="text-display font-heading text-white">
                {collection.name}
              </h1>
            </Container>
          </div>
        </div>
      </section>

      <Container className="py-16 sm:py-20">
        {collection.description && (
          <p className="max-w-2xl text-muted-foreground leading-relaxed mb-14">
            {collection.description}
          </p>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Coming soon"
            description="We're still adding pieces to this collection. Check back shortly."
            action={{ href: "/products", label: "Browse all products" }}
          />
        )}
      </Container>
    </>
  );
}