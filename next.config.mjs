/**
 * next.config.mjs
 * Next.js configuration for Deval Luxury.
 *
 * Two jobs:
 *   1. Allow next/image to load photos from Supabase Storage (real uploads)
 *      and from Unsplash (placeholder seed data).
 *   2. Enable modern image formats (AVIF/WebP) so the site stays fast.
 */

/** @type {import('next').NextConfig} */

// Our Supabase project URL, e.g. "https://abcdefghijklm.supabase.co".
// It is a NEXT_PUBLIC_ variable because the browser also needs it for uploads.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// next/image refuses to load remote images unless we explicitly allow the host.
// We build that allow-list from the environment variable so the same code works
// on localhost, preview deploys, and production without edits.
const remotePatterns = [];

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    remotePatterns.push({
      // "https" (we strip the trailing colon that URL gives us)
      protocol: url.protocol.replace(":", ""),
      // "abcdefghijklm.supabase.co"
      hostname: url.hostname,
      // Only public objects from Storage are allowed - nothing else on that host.
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // A malformed URL should not break the build. If this happens, double-check
    // NEXT_PUBLIC_SUPABASE_URL in your .env.local file.
  }
}

// Unsplash hosts the placeholder images used in seed data. Once real
// photography is uploaded through the admin, this entry can be removed.
//
// IMPORTANT: this line must be OUTSIDE the "if (supabaseUrl)" block above,
// so the Unsplash host is always allowed even if the Supabase URL is
// temporarily missing.
remotePatterns.push({
  protocol: "https",
  hostname: "images.unsplash.com",
  pathname: "/**",
});

const nextConfig = {
  // Helps catch bugs early by double-rendering components in development.
  reactStrictMode: true,

  images: {
    remotePatterns,

    // Serve AVIF or WebP when the browser supports them. These are much smaller
    // than JPEG/PNG, which matters a lot for a photography-heavy luxury site.
    formats: ["image/avif", "image/webp"],

    // The widths next/image generates for full-width / large images.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],

    // The widths next/image generates for small, fixed-size images
    // (thumbnails, avatars, admin previews).
    imageSizes: [64, 96, 128, 200, 256, 384, 512],
  },
};

export default nextConfig;