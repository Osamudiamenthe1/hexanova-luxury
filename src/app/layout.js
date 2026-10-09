/**
 * src/app/layout.js
 * The ROOT layout. Loads the fonts, wires up next-themes, and defines the
 * <html> and <body> tags. Every page on the site inherits from this file.
 *
 * The metadata title AND description are dynamic: they read from
 * site_settings (brand_name and hero_subheadline) so editing the site
 * in the admin also updates browser tab titles, search results, and
 * social link previews.
 */

import { Cormorant_Garamond, Inter } from "next/font/google";
import ThemeProvider from "@/components/providers/theme-provider";
import { getSettings } from "@/lib/data/settings";
import "./globals.css";

/* ---------------------------------------------------------------------------
   FONTS
   --------------------------------------------------------------------------- */

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* ---------------------------------------------------------------------------
   METADATA
   generateMetadata is async and reads from the database, so the values
   stay in sync with the admin settings.
   --------------------------------------------------------------------------- */

export async function generateMetadata() {
  const settings = await getSettings();

  const brandName = settings.brand_name || "HexaNova Luxury";
  // The same description used by the hero and the footer. If we ever want
  // a separate SEO description, add a "meta_description" key to the
  // settings table and swap it in below.
  const description =
    settings.hero_subheadline ||
    `A design studio and furniture atelier based in ${settings.city || "Nigeria"}. We design interiors and build the pieces that fill them.`;

  // Default share image. Used by pages that do not set their own
  // (home, about, services, contact). Falls back to the hero image if the
  // admin has uploaded one - otherwise we omit it and social apps show a
  // text-only card.
  const shareImage = settings.hero_image_url || null;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: `${brandName} - Interiors and Furniture, Made in Nigeria`,
      template: `%s - ${brandName}`,
    },
    description,
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: "en_NG",
      description,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    // Twitter falls back to openGraph fields if not set explicitly, but
    // setting card type here gives a nice large preview on Twitter/X.
    twitter: {
      card: "summary_large_image",
    },
  };
}

/* ---------------------------------------------------------------------------
   VIEWPORT
   --------------------------------------------------------------------------- */

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
