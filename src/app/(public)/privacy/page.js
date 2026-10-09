/**
 * src/app/(public)/privacy/page.js
 * Placeholder Privacy Policy.
 *
 * IMPORTANT: This is a placeholder. Replace it with text reviewed by a
 * qualified person before launch. The notice at the top of the page
 * makes that clear so nothing ships by accident.
 */

import Container from "@/components/ui/container";

export const metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <Container size="narrow" className="py-16 sm:py-20">
      <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 px-5 py-4 rounded-md mb-10 text-sm">
        <strong>Placeholder:</strong> This page must be replaced with a
        reviewed Privacy Policy before launch.
      </div>

      <h1 className="text-display-sm font-heading mb-8">Privacy Policy</h1>

      <div className="prose max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          HexaNova Luxury collects personal information only when you submit an
          enquiry through this website or contact us directly. We use that
          information to respond to your enquiry, to discuss a project, and to
          send you information you have asked for.
        </p>
        <p>
          We do not sell, rent, or share your personal information with third
          parties for marketing purposes.
        </p>
        <p>
          Enquiries are stored securely. If you would like us to delete your
          information, email us and we will do so.
        </p>
        <p>
          This website uses cookies only where necessary to remember your
          theme preference (light or dark) and, if you submit a form, to
          prevent duplicate submissions.
        </p>
        <p>
          For questions about this policy, please contact us through the
          contact page.
        </p>
      </div>
    </Container>
  );
}