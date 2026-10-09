/**
 * src/components/layout/logo.js
 * The brand logo, rendered as styled text.
 *
 * Rendered in the accent colour with a theme-aware contrast stroke:
 *   - Light theme: black outline around the gold text.
 *   - Dark theme:  white outline around the gold text.
 * See ".text-accent-stroked" in globals.css for the mechanics.
 */

import Link from "next/link";

export default function Logo({ className = "", brandName = "HexaNova Luxury" }) {
  return (
    <Link
      href="/"
      className={`font-heading tracking-[0.2em] uppercase text-lg leading-none text-accent text-accent-stroked hover:text-accent-hover transition-colors duration-200 ${className}`}
      aria-label={`${brandName} - go to home page`}
    >
      {brandName}
    </Link>
  );
}