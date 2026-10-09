/**
 * src/app/(public)/products/[slug]/page.js
 * The product detail page.
 *
 * Layout:
 *   - Left: image gallery with lightbox
 *   - Right: name, price, description, materials, dimensions, lead time,
 *     and enquiry buttons
 *   - Below: "Seen in these projects" if the product is used in any
 *   - Below: "Complete the room" related products from the same category
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeading from "@/components/ui/section-heading";
import ImageGallery from "@/components/ui/image-gallery";
import ProductCard from "@/components/ui/product-card";
import JsonLd from "@/components/seo/json-ld";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { supabasePublic } from "@/lib/supabase/public";
import StickyEnquiryBar from "@/components/ui/sticky-enquiry-bar";
import Image from "next/image";
import OrderingSteps from "@/components/ui/ordering-steps";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  // Read the current brand name so og:site_name stays in sync when the
  // admin renames the brand.
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";

  const description =
    product.short_description ||
    product.description?.slice(0, 160) ||
    `${product.name} from ${brandName}.`;

  const primaryImage = product.product_images?.[0]?.image_url || null;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    // openGraph here REPLACES the parent's, so we re-include siteName and
    // locale ourselves. Both now read from settings.
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: "en_NG",
      title: product.name,
      description,
      ...(primaryImage ? { images: [primaryImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

/**
 * Fetch projects that use this product.
 */
async function getProjectsForProduct(productId) {
  const { data, error } = await supabasePublic
    .from("project_products")
    .select(`project:projects ( id, title, slug, cover_image_url, status )`)
    .eq("product_id", productId);

  if (error) {
    console.error("getProjectsForProduct error:", error.message);
    return [];
  }

  return (data || [])
    .map((row) => row.project)
    .filter((p) => p && p.status === "published");
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products, projects, and settings in parallel.
  const [related, projects, settings] = await Promise.all([
    getRelatedProducts(product.category_id, product.id, 4),
    getProjectsForProduct(product.id),
    getSettings(),
  ]);

  const whatsappNumber = settings.whatsapp_number || "";
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/products/${product.slug}`;
  const whatsappMessage = `Hello HexaNova Luxury, I would like to enquire about the ${product.name} (${productUrl}).`;

  return (
    <Container className="py-12 sm:py-16">
      {/* Product structured data. Tells Google the name, image, price,
          and availability so it can show rich results in search. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description:
            product.short_description ||
            product.description?.slice(0, 200) ||
            undefined,
          image:
            product.product_images?.length > 0
              ? product.product_images.map((i) => i.image_url)
              : undefined,
          category: product.categories?.name || undefined,
          brand: {
            "@type": "Brand",
            name: "HexaNova Luxury",
          },
          offers:
            product.show_price && product.price != null
              ? {
                  "@type": "Offer",
                  price: Number(product.price).toFixed(2),
                  priceCurrency: "NGN",
                  availability: "https://schema.org/MadeToOrder",
                  url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/products/${product.slug}`,
                }
              : undefined,
        }}
      />

      {/* Breadcrumb */}
      <nav
        className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/products"
          className="hover:text-foreground transition-colors duration-200 link-underline"
        >
          Shop
        </Link>
        {product.categories?.name && (
          <>
            <span className="mx-3 text-muted-foreground/50">/</span>
            <Link
              href={`/categories/${product.categories.slug}`}
              className="hover:text-foreground transition-colors duration-200 link-underline"
            >
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: gallery */}
        <div>
          <ImageGallery
            images={product.product_images}
            productName={product.name}
          />
        </div>

        {/* RIGHT: info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-display-sm font-heading mb-4">{product.name}</h1>

          <p className="text-xl mb-8">
            {formatPrice(product.price, product.show_price)}
          </p>

          {product.short_description && (
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.short_description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Button
              id="main-enquire-button"
              href={`/contact?product=${encodeURIComponent(product.slug)}`}
              size="lg"
            >
              Enquire about this piece
            </Button>

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-border text-sm font-medium hover:border-foreground/40 hover:bg-muted/40 transition-all duration-200"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>

          {/* Specs table */}
          <dl className="border-t border-border">
            <SpecRow label="Materials" value={product.materials} />
            <SpecRow label="Dimensions" value={product.dimensions} />
            <SpecRow label="Lead time" value={product.lead_time} />
            {product.categories?.name && (
              <SpecRow label="Category" value={product.categories.name} />
            )}
          </dl>

          {/* Long description */}
          {product.description && (
            <div className="mt-10 pt-10 border-t border-border">
              <h2 className="font-heading text-xl mb-4">About this piece</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How ordering works. Shown to every visitor, whether or not they
          scroll on to the projects or related-products sections below. */}
      <OrderingSteps />

      {/* Seen in these projects */}
      {projects.length > 0 && (
        <section className="mt-24 pt-16 border-t border-border">
          <SectionHeading
            eyebrow="Portfolio"
            title="Seen in these projects"
            className="mb-10"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={70}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {project.title}
                    </div>
                  )}
                </div>
                <p className="mt-4 font-heading text-lg">{project.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Complete the room */}
      {related.length > 0 && (
        <section className="mt-24 pt-16 border-t border-border">
          <SectionHeading
            eyebrow="Complete the room"
            title="You might also like"
            className="mb-10"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      {/* Mobile-only sticky bar. Appears after the main Enquire button
          scrolls out of view. Renders nothing on desktop. */}
      <StickyEnquiryBar
        price={product.price}
        showPrice={product.show_price}
        contactHref={`/contact?product=${encodeURIComponent(product.slug)}`}
      />
    </Container>
  );
}

/**
 * A row in the specifications list. Renders nothing if the value is empty.
 */
function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-4 border-b border-border text-sm">
      <dt className="w-32 shrink-0 text-muted-foreground uppercase tracking-widest text-xs pt-0.5">
        {label}
      </dt>
      <dd className="text-foreground/90 leading-relaxed">{value}</dd>
    </div>
  );
}
