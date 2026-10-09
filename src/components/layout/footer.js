/**
 * src/components/layout/footer.js
 * The site footer.
 *
 * The brand description comes from site_settings.hero_subheadline, passed
 * in by the public layout. Contact details come from site_settings too.
 *
 * Every contact line is conditional. If the admin leaves an item blank,
 * the line simply does not render.
 */

import Link from "next/link";

const YEAR = new Date().getFullYear();

// Fallback text used only when no description prop is provided.
const FALLBACK_DESCRIPTION =
  "A design studio and furniture atelier based in Benin City. We design interiors and build the pieces that fill them.";

export default function Footer({
  brandName = "HexaNova Luxury",
  email = "",
  address = "",
  phone = "",
  whatsappNumber = "",
  description = FALLBACK_DESCRIPTION,
}) {
  // Strip everything except digits for the wa.me link.
  const whatsappDigits = whatsappNumber
    ? String(whatsappNumber).replace(/[^\d]/g, "")
    : "";
  const whatsappMessage = encodeURIComponent(
    `Hello ${brandName}, I'd like to enquire.`
  );

  return (
    <footer
      id="site-footer"
      className="mt-24 border-t border-border bg-card/40 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-heading tracking-[0.2em] uppercase text-base text-accent text-accent-stroked mb-3">
              {brandName}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Explore
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Contact
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                >
                  Enquiries
                </Link>
              </li>
              {address && (
                <li className="text-foreground/75">{address}</li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                  >
                    {email}
                  </a>
                </li>
              )}
              {whatsappDigits && (
                <li>
                  <a
                    href={`https://wa.me/${whatsappDigits}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-foreground/75 hover:text-foreground transition-colors duration-200"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {YEAR} {brandName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="link-underline hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="link-underline hover:text-foreground transition-colors duration-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}