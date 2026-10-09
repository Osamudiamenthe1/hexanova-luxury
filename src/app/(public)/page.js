/**
 * src/app/(public)/page.js
 * The HexaNova Luxury home page.
 *
 * Sections, in order:
 *   1. Hero (headline, subheadline, image, two buttons)
 *   2. Featured collections
 *   3. Featured products (up to 8)
 *   4. Featured projects (up to 3)
 *   5. Brand story teaser (about)
 *   6. Testimonials
 *   7. Closing enquiry CTA
 *
 * Uses PUBLIC data queries only. Cached for 60 seconds so it feels fast.
 */

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/ui/product-card";
import ProjectCard from "@/components/ui/project-card";
import PlaceholderImage from "@/components/ui/placeholder-image";
import JsonLd from "@/components/seo/json-ld";
import { getSettings } from "@/lib/data/settings";
import { getFeaturedCollections } from "@/lib/data/collections";
import { getFeaturedProducts } from "@/lib/data/products";
import { getFeaturedProjects } from "@/lib/data/projects";
import { supabasePublic } from "@/lib/supabase/public";

// Cache the page for 60 seconds. Good balance: fresh enough, fast enough.
export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    description:
      settings.hero_subheadline ||
      `A design studio and furniture atelier based in ${settings.city || "Nigeria"}. We design interiors and build the pieces that fill them.`,
  };
}

/**
 * Fetch testimonials. Kept inline here because it's only used on this page.
 * If we ever need it elsewhere, move it into src/lib/data/testimonials.js.
 */
async function getVisibleTestimonials(limit = 3) {
  const { data, error } = await supabasePublic
    .from("testimonials")
    .select("id, author_name, author_title, quote")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getVisibleTestimonials error:", error.message);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  // Fetch everything the page needs in parallel - faster than one-by-one.
  const [settings, collections, products, projects, testimonials] =
    await Promise.all([
      getSettings(),
      getFeaturedCollections(3),
      getFeaturedProducts(8),
      getFeaturedProjects(3),
      getVisibleTestimonials(3),
    ]);

  return (
    <>
            {/* LocalBusiness structured data. Helps search engines show the
          studio in local and rich results. Uses the FurnitureStore subtype
          of LocalBusiness, which is the closest schema.org fit for a
          furniture brand with a physical studio. All values come from
          site_settings - if the admin leaves a field blank, we omit it
          from the JSON-LD rather than ship an empty property. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          name: settings.brand_name || "HexaNova Luxury",
          url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          description:
            settings.tagline ||
            "A design studio and furniture atelier in Nigeria.",
          ...(settings.hero_image_url
            ? { image: settings.hero_image_url }
            : {}),
          ...(settings.phone ? { telephone: settings.phone } : {}),
          ...(settings.email ? { email: settings.email } : {}),
          address: {
            "@type": "PostalAddress",
            ...(settings.address
              ? { streetAddress: settings.address }
              : {}),
            addressLocality: settings.city || "Benin City",
            addressCountry: "NG",
          },
          ...(settings.service_areas
            ? {
                areaServed: settings.service_areas
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }
            : {}),
          ...(settings.opening_hours
            ? { openingHours: settings.opening_hours }
            : {}),
          sameAs: [
            settings.instagram_url,
            settings.facebook_url,
          ].filter(Boolean),
        }}
      />

      {/* ================================================================
          HERO
          Full-bleed, quiet, and generous. If no hero image, use the warm
          placeholder instead.
          ================================================================ */}
      <section className="relative">
        <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden bg-muted">
          {settings.hero_image_url ? (
            <Image
              src={settings.hero_image_url}
              alt={settings.hero_headline || "Deval Luxury"}
              fill
              priority
              sizes="100vw"
              quality={75}
              className="object-cover"
            />
          ) : (
            <PlaceholderImage label="Hero image" aspect="aspect-auto h-full" />
          )}

          {/* A soft dark overlay so the white text reads on any photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10"
          />

          {/* Hero content sits above the image. */}
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-16 sm:pb-24">
              <div className="max-w-2xl text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-5">
                  {settings.tagline ||
                    "Interiors and furniture, made in Nigeria."}
                </p>

                <h1 className="text-display-lg font-heading mb-6 text-white">
                  {settings.hero_headline || "Rooms made to be lived in."}
                </h1>

                <p className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed mb-9">
                  {settings.hero_subheadline ||
                    `A design studio and furniture atelier based in ${settings.city || "Nigeria"}.`}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button href="/products" size="lg">
                    Explore Collections
                  </Button>
                  <Button
                    href="/contact"
                    variant="outline"
                    size="lg"
                    glassTone="light"
                    className="border-white/40 text-white hover:bg-white/15 hover:border-white/60"
                  >
                    Book a Consultation
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURED COLLECTIONS
          ================================================================ */}
      {collections.length > 0 && (
        <section className="py-24 sm:py-32">
          <Container>
            <SectionHeading
              eyebrow="Curated"
              title="Featured collections"
              description="Smaller groupings of pieces that sit well together."
              className="mb-14"
            />

            <div className="grid gap-8 md:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group block"
                >
                  <div className="overflow-hidden bg-muted">
                    {collection.cover_image_url ? (
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={collection.cover_image_url}
                          alt={collection.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          quality={70}
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <PlaceholderImage
                        label={collection.name}
                        aspect="aspect-[4/5]"
                      />
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="font-heading text-xl">{collection.name}</h3>
                    {collection.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================
          FEATURED PRODUCTS
          ================================================================ */}
      {products.length > 0 && (
        <section className="py-24 sm:py-32 bg-card/40">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <SectionHeading
                eyebrow="Selected pieces"
                title="Featured furniture"
              />
              <Button href="/products" variant="outline" size="sm">
                View all products
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================
          FEATURED PROJECTS
          ================================================================ */}
      {projects.length > 0 && (
        <section className="py-24 sm:py-32">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <SectionHeading
                eyebrow="Portfolio"
                title="Selected projects"
                description="A small selection of interiors we've designed."
              />
              <Button href="/projects" variant="outline" size="sm">
                View all projects
              </Button>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================
          BRAND STORY TEASER
          Two-column: text on the left, image on the right.
          ================================================================ */}
      <section className="py-24 sm:py-32 bg-card/40">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="The studio"
                title={settings.about_title || "A studio and a workshop."}
                className="mb-6"
              />
              <p className="text-muted-foreground leading-relaxed mb-8">
                {settings.about_body ||
                  "HexaNova Luxury is two businesses under one roof: an interior design studio and a furniture atelier. We take on a small number of projects each year so we can give each one the attention it deserves."}
              </p>
              <Button href="/about" variant="outline">
                Read our story
              </Button>
            </div>

            <div className="overflow-hidden bg-muted">
              {settings.about_image_url ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={settings.about_image_url}
                    alt={settings.about_title || "About Deval Luxury"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={70}
                    className="object-cover"
                  />
                </div>
              ) : (
                <PlaceholderImage
                  label="Studio photograph"
                  aspect="aspect-[4/3]"
                />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================
          TESTIMONIALS
          ================================================================ */}
      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32">
          <Container>
            <SectionHeading
              eyebrow="Kind words"
              title="What clients say"
              align="center"
              className="mb-14"
            />

            <div className="grid gap-10 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="text-center">
                  <blockquote className="font-heading text-xl leading-relaxed text-foreground/90 mb-6">
                    <span
                      aria-hidden="true"
                      className="text-accent text-3xl leading-none align-top mr-1"
                    >
                      “
                    </span>
                    {t.quote}
                  </blockquote>
                  <figcaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.author_name}
                    {t.author_title && ` · ${t.author_title}`}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================
          CLOSING CTA
          ================================================================ */}
      <section className="py-24 sm:py-32 bg-card/40">
        <Container size="narrow" className="text-center">
          <SectionHeading
            title="Let's design something together."
            description="Whether you're furnishing one room or rethinking a whole home, we'd love to hear about it. Tell us what you have in mind."
            align="center"
            className="mb-10"
          />
          <div className="flex justify-center flex-wrap gap-4">
            <Button href="/contact" size="lg">
              Start an enquiry
            </Button>
            <Button href="/projects" variant="outline" size="lg">
              See our work
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
