/**
 * src/components/seo/json-ld.js
 * Renders a JSON-LD <script> tag. Search engines read this and use it
 * to build rich results (prices in search, sitelinks, etc.).
 *
 * React escapes the JSON by default, so we use dangerouslySetInnerHTML
 * with JSON.stringify - this is the standard pattern and is safe because
 * JSON.stringify produces valid, escaped JSON.
 */

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}