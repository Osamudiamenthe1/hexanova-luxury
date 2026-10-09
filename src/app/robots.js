/**
 * src/app/robots.js
 * Generates /robots.txt. Tells search engines what to crawl and where
 * the sitemap is.
 *
 * IMPORTANT PATTERN - two ways to keep a page out of the index:
 *
 *   1. Disallow in robots.txt -> the crawler does not fetch the page at
 *      all. This is right for pages behind auth (/admin), because no
 *      crawler can get in anyway.
 *
 *   2. Allow in robots.txt + `noindex` meta on the page -> the crawler
 *      fetches the page, sees the noindex instruction, and drops it from
 *      the index. This is right for /privacy and /terms, which ARE public
 *      and can be linked from anywhere.
 *
 * If you disallow a page in robots.txt AND set noindex on it, the two
 * cancel each other out: the crawler never gets to see the noindex. So
 * /privacy and /terms are NOT disallowed here - they are handled by their
 * own page metadata.
 */

export default function robots() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only the admin is disallowed. The admin pages are behind auth,
        // so a crawler cannot reach their content even if it tried.
        disallow: ["/admin", "/admin/", "/admin/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}