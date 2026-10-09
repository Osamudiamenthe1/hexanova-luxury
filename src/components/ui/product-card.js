/**
 * src/components/ui/product-card.js
 * A single product tile for grids.
 *
 * IMAGE SIZES:
 * Cards render in a 2-column grid on mobile (<1024px), so each tile is
 * 50% of the viewport width. Above 1024px the grid becomes 3 or 4 columns,
 * so 33vw is a safe over-estimate that avoids blurry images while still
 * cutting file size substantially.
 *
 * HOVER IMAGE ON TOUCH DEVICES:
 * The secondary image is for the hover crossfade on desktop. On a phone,
 * there is no hover - the image would never be seen, but would still be
 * downloaded. So we hide the secondary image container entirely on
 * non-hover devices with the Tailwind class
 *   hidden [@media(hover:hover)]:block
 * Browsers do not fetch lazy <img> elements that are display:none, so
 * phones skip that download entirely. Desktop is unaffected.
 *
 * ACCESSIBILITY:
 * The link has no aria-label. The visible text (name, category, price)
 * IS the accessible name. This satisfies WCAG 2.5.3.
 */

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import PlaceholderImage from "./placeholder-image";

export default function ProductCard({ product }) {
  if (!product) return null;

  const images = product.product_images || [];
  const primaryImage = images[0];
  const secondaryCandidate = images[1];

  const secondaryImage =
    secondaryCandidate &&
    secondaryCandidate.image_url &&
    secondaryCandidate.image_url !== primaryImage?.image_url
      ? secondaryCandidate
      : null;

  // Matches the 2-column mobile grid and the 3/4-column desktop grids.
  const sizes = "(max-width: 1024px) 50vw, 33vw";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-muted">
        {primaryImage ? (
          <>
            <div className="relative aspect-[4/5]">
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                sizes={sizes}
                quality={70}
                className={`object-cover transition-opacity duration-500 ${
                  secondaryImage ? "group-hover:opacity-0" : ""
                }`}
              />
            </div>

            {secondaryImage && (
              <div
                // `hidden` on touch devices (no hover). `[@media(hover:hover)]:block`
                // re-enables it on hover-capable devices, where the crossfade
                // is the intended effect.
                className="hidden [@media(hover:hover)]:block absolute inset-0"
              >
                <Image
                  src={secondaryImage.image_url}
                  alt=""
                  fill
                  sizes={sizes}
                  quality={70}
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </div>
            )}
          </>
        ) : (
          <PlaceholderImage label={product.name} aspect="aspect-[4/5]" />
        )}
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-heading text-lg leading-tight line-clamp-1">
          {product.name}
        </h3>

        {product.categories?.name && (
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {product.categories.name}
          </p>
        )}

        <p className="text-sm text-foreground/90 pt-1">
          {formatPrice(product.price, product.show_price)}
        </p>
      </div>
    </Link>
  );
}