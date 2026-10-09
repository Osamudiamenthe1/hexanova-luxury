/**
 * src/app/(public)/about/page.js
 * About page. Content comes from site_settings (about_title, about_body,
 * about_image_url) with sensible sample fallbacks.
 */

import Image from "next/image";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import PlaceholderImage from "@/components/ui/placeholder-image";
import Button from "@/components/ui/button";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";
  const city = settings.city || "Nigeria";
  return {
    title: "About",
    description:
      settings.about_body?.slice(0, 160) ||
      `The story of ${brandName}: an interior design studio and furniture atelier based in ${city}.`,
  };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const city = settings.city || "Nigeria";

  return (
    <>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="The studio"
          title={settings.about_title || "A studio and a workshop."}
          className="mb-12"
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-start">
          {/* Text */}
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            {(
              settings.about_body ||
              `HexaNova Luxury is two businesses under one roof: an interior design studio and a furniture atelier. We take on a small number of projects each year so we can give each one the attention it deserves. Everything we make is built in our ${city} workshop, by people we know by name.`
            )
              .split("\n\n")
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}

            <p>
              We work in solid hardwoods, natural textiles, and hand-finished
              metals. We favour pieces that age well and rooms that get better
              the longer you live in them.
            </p>

            <div className="pt-4">
              <Button href="/contact" variant="outline">
                Work with us
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden bg-muted">
              {settings.about_image_url ? (
                <div className="relative aspect-[4/5]">
                  <Image
                    src={settings.about_image_url}
                    alt={settings.about_title || "HexaNova Luxury"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <PlaceholderImage
                  label="Studio photograph"
                  aspect="aspect-[4/5]"
                />
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Values / closing block */}
      <section className="py-24 sm:py-32 bg-card/40">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Made here
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every piece is built in our {city} workshop. We know the people
                who make our furniture by name, and we pay them properly.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Small by design
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We take on a handful of projects each year. It keeps the work
                personal and the standard high.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Built to last
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Solid hardwoods, natural fibres, and finishes that age well.
                Nothing disposable, nothing on trend for its own sake.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
