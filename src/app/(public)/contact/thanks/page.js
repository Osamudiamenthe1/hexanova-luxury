/**
 * src/app/(public)/contact/thanks/page.js
 * Confirmation page shown after a successful enquiry submission.
 *
 * Purposes:
 *   1. Give the visitor a clear "we got it" signal.
 *   2. Provide a URL to track as a conversion in analytics.
 *   3. Prevent accidental double-submits (the form is gone).
 *   4. Offer a next step so the visitor stays engaged while they wait.
 *
 * SEO: noindex, follow - we do NOT want this page in search results,
 * but we DO want search engines to follow its outbound links.
 */

import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Thank you",
  description: "Your enquiry has been received.",
  robots: { index: false, follow: true },
};

export default async function ThanksPage() {
  const settings = await getSettings();
  const whatsappNumber = settings.whatsapp_number || "";
  const brandName = settings.brand_name || "HexaNova Luxury";

  return (
    <Container size="narrow" className="py-24 sm:py-32 text-center">
      {/* Small eyebrow label */}
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
        Thank you
      </p>

      {/* Main heading */}
      <h1 className="text-display font-heading mb-6">
        We&apos;ve received your enquiry.
      </h1>

      {/* Reassurance copy */}
      <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
        {brandName} replies to every enquiry personally, usually within one
        business day. If your message is urgent, WhatsApp is the fastest way
        to reach us.
      </p>

      {/* Primary actions: WhatsApp (if configured), then browse */}
      <div className="flex justify-center flex-wrap gap-4 mb-20">
        {whatsappNumber && (
          <WhatsAppButton
            number={whatsappNumber}
            message={`Hello ${brandName}, I just submitted an enquiry on your website and would like to follow up.`}
          />
        )}
        <Button href="/projects" size="lg">
          See our work
        </Button>
        <Button href="/products" variant="outline" size="lg">
          Browse the shop
        </Button>
      </div>

      {/* Secondary links while they wait */}
      <div className="pt-12 border-t border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          While you wait
        </p>
        <div className="flex justify-center gap-8 text-sm">
          <a
            href="/services"
            className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
          >
            What we do
          </a>
          <a
            href="/about"
            className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
          >
            About the studio
          </a>
        </div>
      </div>
    </Container>
  );
}