/**
 * src/app/(public)/terms/page.js
 * Placeholder Terms of Use.
 *
 * IMPORTANT: This is a placeholder. Replace it with text reviewed by a
 * qualified person before launch.
 */

import Container from "@/components/ui/container";

export const metadata = {
  title: "Terms of Use",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <Container size="narrow" className="py-16 sm:py-20">
      <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 px-5 py-4 rounded-md mb-10 text-sm">
        <strong>Placeholder:</strong> This page must be replaced with reviewed
        Terms of Use before launch.
      </div>

      <h1 className="text-display-sm font-heading mb-8">Terms of Use</h1>

      <div className="prose max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          This website is provided by HexaNova Luxury for general information.
          Prices, availability, and lead times shown on product pages are
          indicative and confirmed at the time of order.
        </p>
        <p>
          Every piece is made to order. Lead times are estimates and may vary
          based on materials and workshop capacity.
        </p>
        <p>
          Images on this site are for illustration. Because our furniture is
          handmade, finish and grain will vary slightly between pieces.
        </p>
        <p>
          All content on this site, including text and images, is the property
          of HexaNova Luxury unless otherwise noted. You may not reproduce it
          without written permission.
        </p>
        <p>
          These terms are governed by the laws of the Federal Republic of
          Nigeria.
        </p>
      </div>
    </Container>
  );
}