/**
 * src/app/(public)/contact/page.js
 * Contact / enquiry page.
 *
 * The form adapts to context passed in the URL:
 *   - ?product=<slug>  -> product enquiry, message pre-filled, type locked
 *   - ?project=<slug>  -> consultation request, message pre-filled, type locked
 *   - neither          -> general contact with a type dropdown
 *
 * The left column shows address, email, phone, and — if configured — a
 * prominent WhatsApp button. Every item hides when its setting is empty.
 */

import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ContactForm from "./contact-form";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { supabasePublic } from "@/lib/supabase/public";
import { getSettings } from "@/lib/data/settings";
import OrderingSteps from "@/components/ui/ordering-steps";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";
  return {
    title: "Contact",
    description: `Start an enquiry or book a consultation with ${brandName}. We reply to every message personally.`,
  };
}

/**
 * Look up a published product by slug. Returns null on any error or
 * empty slug — a bad slug should not break the page.
 */
async function getProductBySlug(slug) {
  if (!slug) return null;
  const { data, error } = await supabasePublic
    .from("products")
    .select("id, name")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("contact: getProductBySlug error:", error.message);
    return null;
  }
  return data;
}

/**
 * Look up a published project by slug. Same rules as above.
 */
async function getProjectBySlug(slug) {
  if (!slug) return null;
  const { data, error } = await supabasePublic
    .from("projects")
    .select("id, title")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("contact: getProjectBySlug error:", error.message);
    return null;
  }
  return data;
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const productSlug = params?.product || null;
  const projectSlug = params?.project || null;

  const [product, project, settings] = await Promise.all([
    getProductBySlug(productSlug),
    getProjectBySlug(projectSlug),
    getSettings(),
  ]);

  const brandName = settings.brand_name || "HexaNova Luxury";
  const whatsappNumber = settings.whatsapp_number || "";

  // Pick the heading depending on which context we're in.
  // Product takes precedence if both are somehow passed.
  let eyebrow = "Get in touch";
  let title = "Let's talk about your project.";
  let description =
    "Whether it's a single piece or a full interior, we'd love to hear what you're planning.";

  if (product) {
    eyebrow = "Product enquiry";
    title = `Enquire about the ${product.name}`;
    description =
      "Tell us a little about what you have in mind. We'll reply personally with finishes, lead time, and pricing details.";
  } else if (project) {
    eyebrow = "Consultation";
    title = "Let's talk about your project.";
    description = `You liked the ${project.title}. Tell us about your own space and we'll come back with ideas, timing, and a sense of budget.`;
  }

  return (
    <Container className="py-16 sm:py-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        {/* Left column: intro + contact details + WhatsApp */}
        <div>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-10"
          />

          <dl className="space-y-6 text-sm">
            {settings.address && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Studio
                </dt>
                <dd className="text-foreground/90">{settings.address}</dd>
              </div>
            )}

            {settings.email && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${settings.email}`}
                    className="link-underline text-foreground/90 hover:text-foreground transition-colors duration-200"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
            )}

            {settings.phone && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Phone
                </dt>
                <dd>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="link-underline text-foreground/90 hover:text-foreground transition-colors duration-200"
                  >
                    {settings.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {/* WhatsApp: labelled and prominent. Only rendered if the number
              is set in the admin settings. On many devices this is the
              fastest path to a real conversation. */}
          {whatsappNumber && (
            <div className="mt-10 pt-10 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Prefer WhatsApp?
              </p>
              <WhatsAppButton
                number={whatsappNumber}
                message={`Hello ${brandName}, I'd like to enquire about a project.`}
                label="Message us on WhatsApp"
              />
            </div>
          )}
        </div>

        {/* Right column: form */}
        <div>
          <ContactForm
            productId={product?.id}
            productName={product?.name}
            projectName={project?.title}
          />
        </div>
      </div>
      {/* How ordering works. Placed below the form so a visitor who has
          just submitted (or is about to) knows exactly what happens next. */}
      <OrderingSteps />
    </Container>
  );
}
