/**
 * src/app/(public)/projects/[slug]/page.js
 * A single project (case study) page.
 *
 * Sections:
 *   1. Hero image with title
 *   2. Brief: location, year, client, summary
 *   3. Long description
 *   4. Image gallery
 *   5. Products used in the project, linked back to their product pages
 *   6. Closing CTA -> /contact?project=<slug> (carries the project into the
 *      form so the visitor's message is pre-filled)
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeading from "@/components/ui/section-heading";
import PlaceholderImage from "@/components/ui/placeholder-image";
import ProductCard from "@/components/ui/product-card";
import { getProjectBySlug } from "@/lib/data/projects";
import { getProductsForProject } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";

  const description =
    project.summary || project.description?.slice(0, 160) || undefined;

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: "en_NG",
      title: project.title,
      description,
      ...(project.cover_image_url
        ? { images: [project.cover_image_url] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  // Fetch the products used in this project.
  const products = await getProductsForProject(project.id);

  const metaLine = [project.location, project.year].filter(Boolean).join(" · ");

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-muted">
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              quality={75}
              className="object-cover"
            />
          ) : (
            <PlaceholderImage label={project.title} aspect="aspect-auto h-full" />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"
          />

          <div className="absolute inset-0 flex items-end">
            <Container className="pb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-4">
                {metaLine || "Project"}
              </p>
              <h1 className="text-display font-heading text-white">
                {project.title}
              </h1>
              {project.client_name && (
                <p className="mt-3 text-sm text-white/70">
                  For {project.client_name}
                </p>
              )}
            </Container>
          </div>
        </div>
      </section>

      <Container className="py-16 sm:py-20">
        {/* Brief */}
        {project.summary && (
          <p className="text-xl sm:text-2xl font-heading leading-relaxed max-w-3xl mb-10">
            {project.summary}
          </p>
        )}

        {project.description && (
          <div className="max-w-3xl text-muted-foreground leading-relaxed whitespace-pre-line mb-20">
            {project.description}
          </div>
        )}

        {/* Image gallery */}
        {project.project_images && project.project_images.length > 0 && (
          <section className="mb-24">
            <div className="grid gap-6 md:grid-cols-2">
              {project.project_images.map((img, i) => (
                <div
                  key={img.id || i}
                  className={`relative overflow-hidden bg-muted ${
                    i === 0 ? "md:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || `${project.title} image ${i + 1}`}
                    fill
                    sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    quality={70}
                    className="object-cover"
                  />
                  {img.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-4 py-3">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Products used in this project */}
        {products.length > 0 && (
          <section className="pt-16 border-t border-border">
            <SectionHeading
              eyebrow="In this project"
              title="Products used"
              description="Every piece in this project is available to order, with finishes customised to your space."
              className="mb-12"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Closing CTA — the visitor has just finished reading the whole
            case study. This is the most engaged moment on the page, so we
            offer a clear next step and carry the project slug into the
            contact form so their message is pre-filled. */}
        <section className="mt-24 pt-16 border-t border-border text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Like this?
          </p>
          <h2 className="text-display-sm font-heading mb-6">
            Planning something similar?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Tell us about your space and what you have in mind. We&apos;ll come
            back with ideas, timing, and a sense of budget.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Button
              href={`/contact?project=${encodeURIComponent(project.slug)}`}
              size="lg"
            >
              Start a conversation
            </Button>
            <Button href="/projects" variant="outline" size="lg">
              See more projects
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}