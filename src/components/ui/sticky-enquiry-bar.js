/**
 * src/components/ui/sticky-enquiry-bar.js
 * A bottom bar on product pages, MOBILE ONLY, showing the price and an
 * Enquire button. It appears only when BOTH:
 *   1. The main on-page Enquire button has scrolled out of view, AND
 *   2. The footer is not visible
 *
 * PROJECT-WIDE RULE (established here, applies to all future sticky UI):
 * Any fixed element that sits over the bottom of the viewport must hide
 * when the footer enters view. Otherwise it overlaps the footer's content
 * and makes it unreadable. The footer carries id="site-footer" so any
 * sticky component can find it and use the same observer pattern.
 *
 * HOW IT KNOWS WHEN TO APPEAR (main button):
 * We look up the element with id="main-enquire-button" and observe it with
 * an IntersectionObserver. When its bottom edge scrolls above y=80 (just
 * under the sticky site header), the button is "gone".
 *
 * HOW IT KNOWS WHEN TO HIDE (footer):
 * A second observer watches #site-footer. When the footer becomes visible
 * at all, we force the bar off-screen regardless of where the button is.
 *
 * WHY MOBILE ONLY:
 * On desktop the layout has two columns, so the price and Enquire button
 * are visible next to the gallery without scrolling. No bar needed.
 *
 * WHY A BODY CLASS:
 * The floating WhatsApp button lives in the site-wide public layout, not
 * in this component. When the bar is visible, we add `sticky-enquiry-active`
 * to <body>. A small CSS rule hides the floating button while that class
 * is present, so the two never overlap.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function StickyEnquiryBar({ price, showPrice, contactHref }) {
  const [mounted, setMounted] = useState(false);
  const [buttonOutOfView, setButtonOutOfView] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Wait until mount before touching the DOM. This avoids issues during
  // server-side rendering where there is no document.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Observer 1: watch the main Enquire button.
  useEffect(() => {
    if (!mounted) return;

    const target = document.getElementById("main-enquire-button");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the button's bottom edge is above y=80 (just below the sticky
        // header), it has scrolled fully out of view.
        setButtonOutOfView(entry.boundingClientRect.bottom < 80);
      },
      { threshold: [0, 1] }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [mounted]);

  // Observer 2: watch the site footer. As soon as ANY part of the footer
  // enters the viewport, we want the bar gone.
  useEffect(() => {
    if (!mounted) return;

    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      // No threshold: fires the moment the footer's edge crosses into view.
      { threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [mounted]);

  // Final visibility: button out of view AND footer not in view.
  const visible = buttonOutOfView && !footerVisible;

  // Body class so the floating WhatsApp button can hide itself while the
  // bar is on screen. Cleaned up on unmount.
  useEffect(() => {
    if (visible) {
      document.body.classList.add("sticky-enquiry-active");
    } else {
      document.body.classList.remove("sticky-enquiry-active");
    }
    return () => document.body.classList.remove("sticky-enquiry-active");
  }, [visible]);

  return (
    <div
      // md:hidden means this bar never appears on tablet or desktop.
      className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      // Respect the safe area on notched phones.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        {/* Price block */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Price
          </p>
          <p className="font-heading text-lg leading-tight truncate">
            {formatPrice(price, showPrice)}
          </p>
        </div>

        {/* Enquire button */}
        <Link
          href={contactHref}
          tabIndex={visible ? 0 : -1}
          className="inline-flex items-center justify-center h-11 px-6 shrink-0 rounded-sm bg-accent text-accent-foreground text-xs uppercase tracking-[0.15em] font-medium hover:bg-accent-hover transition-colors duration-200"
        >
          Enquire
        </Link>
      </div>
    </div>
  );
}