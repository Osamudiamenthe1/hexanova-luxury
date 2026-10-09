/**
 * src/app/(public)/services/page.js
 * Services page. Three services plus a 4-step process.
 *
 * The city used in the copy comes from site_settings.city, so it stays
 * correct if the client moves or adds a second location. The SERVICES
 * list is built inside the component (not at module scope) so it can
 * read the current city without re-importing per render.
 */

import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import Button from "@/components/ui/button";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";
  const city = settings.city || "Nigeria";
  return {
    title: "Services",
    description: `Interior design, bespoke furniture, and consultancy from ${brandName}. Based in ${city}, working across the country.`,
  };
}

const PROCESS = [
  {
    step: "01",
    title: "Enquiry",
    text: "Tell us about your space and what you're trying to achieve.",
  },
  {
    step: "02",
    title: "Consultation",
    text: "We visit the space, listen carefully, and discuss the scope.",
  },
  {
    step: "03",
    title: "Concept",
    text: "Drawings, mood boards, and cost estimates for approval.",
  },
  {
    step: "04",
    title: "Delivery",
    text: "We manage production, procurement, and installation to the last detail.",
  },
];

export default async function ServicesPage() {
  const settings = await getSettings();
  const city = settings.city || "Nigeria";

  // Built inside the component so it can read `city`.
  const SERVICES = [
    {
      title: "Interior design",
      description:
        "Full-service interior design from concept to completion. We handle layout, lighting, materials, furniture, and installation, so the client has one point of contact from brief to handover.",
      details: [
        "Concept and mood boards",
        "Space planning and layouts",
        "Material and finish selection",
        "Lighting design",
        "Procurement and installation",
      ],
    },
    {
      title: "Bespoke furniture",
      description: `One-off pieces designed around a specific room and made in our ${city} workshop. Every commission starts with a conversation and a set of drawings, and ends with a piece you'll keep for decades.`,
      details: [
        "Custom sofas, beds, and case goods",
        "Choice of hardwoods, finishes, and upholstery",
        "Drawings, samples, and approvals",
        `Made in our ${city} workshop`,
        "10 to 12 week lead time typical",
      ],
    },
    {
      title: "Consultation",
      description:
        "An hourly or per-room consultancy for clients who want to lead their own project but need expert eyes on layout, palette, and furniture selection.",
      details: [
        "One-off sessions or a block of hours",
        "Layout and palette advice",
        "Furniture and material sourcing",
        "Contractor liaison on request",
      ],
    },
  ];

  return (
    <>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="What we do"
          title="Services"
          description="Three ways we work with clients. Most projects begin with a conversation."
          className="mb-16"
        />

        <div className="space-y-20">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20 pb-20 border-b border-border last:border-b-0 last:pb-0"
            >
              <div>
                <h2 className="font-heading text-3xl leading-tight">
                  {service.title}
                </h2>
              </div>
              <div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.details.map((d) => (
                    <li
                      key={d}
                      className="text-sm text-foreground/80 flex gap-3"
                    >
                      <span aria-hidden="true" className="text-accent">
                        ·
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Process */}
      <section className="py-24 sm:py-32 bg-card/40">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Our process"
            align="center"
            className="mb-16"
          />
          <div className="grid gap-10 md:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step}>
                <p className="font-heading text-4xl text-accent mb-4">
                  {p.step}
                </p>
                <h3 className="font-heading text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <Container size="narrow" className="py-24 sm:py-32 text-center">
        <SectionHeading
          title="Ready to start?"
          description="Tell us about your space and what you have in mind. There's no obligation."
          align="center"
          className="mb-10"
        />
        <Button href="/contact" size="lg">
          Book a consultation
        </Button>
      </Container>
    </>
  );
}