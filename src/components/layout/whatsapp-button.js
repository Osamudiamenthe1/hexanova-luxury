/**
 * src/components/layout/whatsapp-button.js
 * Two WhatsApp components:
 *   - WhatsAppFloat : the floating round button, bottom-right, on every
 *                     public page. Reads the current path so it can pick a
 *                     message that matches where the visitor is.
 *   - WhatsAppButton: an inline labelled button, used on the contact page,
 *                     thanks page, and anywhere else we want a text link.
 *
 * Both render NOTHING if the number is empty. That means call sites never
 * need to wrap them in a conditional.
 *
 * WHY THIS FILE IS A CLIENT COMPONENT:
 * The float uses usePathname() to build a page-aware default message.
 * That hook is client-only, so the whole file is marked "use client".
 * The WhatsAppButton is small enough that the extra bundle cost is
 * negligible (roughly 1 KB, gzipped).
 */

"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

/**
 * Builds a wa.me link. WhatsApp expects the number without "+" or spaces,
 * so we strip everything except digits. The message is URL-encoded.
 */
function buildWhatsAppLink(number, message) {
  const clean = String(number).replace(/[^\d]/g, "");
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${clean}?text=${text}`;
}

/**
 * Picks a sensible default message based on where the visitor is. This
 * gives the WhatsApp chat a little context without trying to guess the
 * exact product or project (which would need the page data, unavailable
 * to a layout-level component).
 */
function defaultMessageForPath(pathname, brandName) {
  // Product detail page: /products/[slug]
  if (/^\/products\/[^/]+/.test(pathname)) {
    return `Hello ${brandName}, I'd like to ask about a piece on your website.`;
  }
  // Project detail page: /projects/[slug]
  if (/^\/projects\/[^/]+/.test(pathname)) {
    return `Hello ${brandName}, I'd like to talk about a project similar to one on your website.`;
  }
  // Shop or a category/collection listing
  if (
    pathname === "/products" ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/collections/")
  ) {
    return `Hello ${brandName}, I'd like help finding the right piece.`;
  }
  // Contact page
  if (pathname.startsWith("/contact")) {
    return `Hello ${brandName}, I'd like to get in touch.`;
  }
  // Fallback for home, about, services, projects list, etc.
  return `Hello ${brandName}, I'd like to enquire about your work.`;
}

/**
 * Floating round button, bottom-right of every public page.
 * Pass `brandName` so the default message reflects the current brand.
 */
export function WhatsAppFloat({ number, brandName = "HexaNova Luxury" }) {
  const pathname = usePathname();
  if (!number) return null;

  const message = defaultMessageForPath(pathname, brandName);

  return (
    <a
      href={buildWhatsAppLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      // The `whatsapp-float` class lets globals.css hide the button when
      // the mobile sticky enquiry bar is visible.
      // bottom uses env(safe-area-inset-bottom) so on notched phones the
      // button sits above the home indicator instead of behind it.
      className="whatsapp-float fixed right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:opacity-90 transition-opacity"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}

/**
 * Inline labelled button. Use on the contact page, thanks page, or
 * anywhere else we want a text link instead of an icon.
 *   - message: optional. Falls back to a plain greeting.
 *   - label:   optional. Defaults to "Chat on WhatsApp".
 */
export function WhatsAppButton({
  number,
  message,
  label = "Chat on WhatsApp",
}) {
  if (!number) return null;

  return (
    <a
      href={buildWhatsAppLink(number, message || "")}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm hover:border-foreground/40 hover:bg-muted/40 transition-colors"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}