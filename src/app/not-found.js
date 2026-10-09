/**
 * src/app/not-found.js
 * The global 404 page. Lives at src/app/not-found.js so it is rendered
 * with the ROOT layout (which doesn't include Header/Footer), so we
 * include them here - and fetch settings so the brand name is current.
 */

import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";
  const email = settings.email || "";
  const address = settings.address || "";
  return (
    <>
      <Header brandName={brandName} />
      <main className="min-h-[60vh]">
        <Container size="narrow" className="py-24 sm:py-32 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            404
          </p>
          <h1 className="text-display font-heading mb-6">
            This page doesn&apos;t exist.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            The link might be broken, or the page may have been moved.
            Let&apos;s get you back to something useful.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Button href="/" size="lg">
              Go home
            </Button>
            <Button href="/products" variant="outline" size="lg">
              Shop furniture
            </Button>
          </div>
        </Container>
      </main>
      <Footer brandName={brandName} email={email} address={address} />
    </>
  );
}
