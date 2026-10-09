/**
 * src/components/layout/header.js
 * The main site header. Receives brandName from the public layout so the
 * logo matches site_settings.brand_name (which the admin can change).
 *
 * Desktop layout: logo | nav | theme toggle | "Book a consultation"
 * Mobile layout:  logo | theme toggle | hamburger, with a full-width CTA
 *                 at the bottom of the mobile menu.
 *
 * The desktop CTA is hidden on mobile to save horizontal space (the mobile
 * menu carries its own full-width version). All existing behavior is
 * preserved: outside click, Escape, resize, and route change all close
 * the mobile menu.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";
import Button from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/products", label: "Shop" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ brandName = "HexaNova Luxury" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on click outside, Escape, or resize up to desktop.
  useEffect(() => {
    if (!mobileOpen) return;

    function handleClickOutside(event) {
      const insideMenu = menuRef.current?.contains(event.target);
      const insideToggle = toggleRef.current?.contains(event.target);
      if (!insideMenu && !insideToggle) {
        setMobileOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo brandName={brandName} />

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-underline text-sm transition-colors duration-200 ${
                    active
                      ? "text-foreground"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Desktop CTA. Hidden on mobile because the mobile menu
                carries its own full-width version. */}
            <div className="hidden md:block">
              <Button href="/contact" size="sm">
                Book a consultation
              </Button>
            </div>

            <span ref={toggleRef} className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-accent/40 text-accent transition-colors duration-200 hover:bg-accent/10 hover:border-accent"
              >
                <span className="relative h-4 w-4">
                  <Menu
                    className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${
                      mobileOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${
                      mobileOpen ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </span>
              </button>
            </span>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-20 right-4 z-50 w-64 rounded-lg border border-border bg-background shadow-lg overflow-hidden animate-slide-down"
        >
          <nav className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                    active
                      ? "text-foreground bg-muted/60"
                      : "text-foreground/75 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}

            {/* Full-width CTA at the bottom of the mobile menu. Separated
                by a divider so it reads as a distinct action, not another
                nav link. */}
            <div className="mt-2 pt-3 px-3 pb-1 border-t border-border">
              <Button
                href="/contact"
                size="sm"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                Book a consultation
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}