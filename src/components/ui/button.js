/**
 * src/components/ui/button.js
 * The site's button component. Three variants:
 *   - primary  : solid accent, used for the single most important action
 *   - outline  : bordered, glassy (frosted) background
 *   - ghost    : no border, glassy background
 *
 * The outline and ghost variants use the same "frosted glass" technique as
 * the site header: a semi-transparent background plus a backdrop blur.
 * The supports-[] fallback means browsers WITHOUT backdrop-blur support
 * get a slightly more opaque background, so text never becomes unreadable.
 *
 * GLASS TONES:
 *   - "default" (used everywhere by default): tinted with the site's
 *     background colour. Correct on the site's normal warm off-white /
 *     warm charcoal surfaces.
 *   - "light": tinted with white. Use this when the button sits over a
 *     dark image (e.g. the home page hero) so it stays visible.
 *
 * If you ever need a solid, non-glassy button, override the background
 * with a className, or add a new variant below.
 */

import Link from "next/link";
import { clsx } from "clsx";

// Two glass tones. Each contains a fallback (opaque-ish) background plus
// the backdrop blur, using the same pattern as the header.
const GLASS_TONES = {
  default:
    "bg-background/85 supports-[backdrop-filter]:bg-background/55 backdrop-blur-md",
  light: "bg-white/10 supports-[backdrop-filter]:bg-white/10 backdrop-blur-md",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  loading = false,
  disabled = false,
  glassTone = "default",
  ...rest
}) {
  // Base classes shared by every button.
  const base =
    "inline-flex items-center justify-center gap-2.5 " +
    "uppercase tracking-[0.15em] font-medium " +
    "transition-all duration-200 ease-out will-change-transform " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:opacity-60 disabled:pointer-events-none";

  const glass = GLASS_TONES[glassTone] || GLASS_TONES.default;

  const variants = {
    // Solid accent — no glass. The primary action should feel like a solid
    // object, not a translucent surface.
    primary:
      "bg-accent text-accent-foreground border border-transparent " +
      "hover:bg-accent-hover hover:-translate-y-px hover:shadow-md " +
      "active:translate-y-0 active:shadow-none",

    // Bordered and glassy. On hover the glass becomes slightly more
    // opaque so the button "solidifies" under the pointer.
    outline:
      `border border-border text-foreground ${glass} ` +
      "hover:border-foreground/60 hover:bg-background/70 hover:-translate-y-px " +
      "active:translate-y-0",

    // No border, glassy, quieter. Same hover idea, less contrast.
    ghost:
      `text-foreground/80 ${glass} ` +
      "hover:text-foreground hover:bg-background/75 " +
      "active:bg-background/80",
  };

  // Text sizes are hardcoded in pixels rather than using Tailwind's rem-based
  // scale, because the uppercase tracking on these labels reads best at very
  // specific sizes. These values are tuned to match the site's 17px root.
  const sizes = {
    sm: "h-9 px-4 text-[11px]",
    md: "h-11 px-6 text-xs",
    lg: "h-12 px-8 text-[13px]",
  };

  const classes = clsx(
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    "rounded-sm",
    className,
  );

  const content = (
    <>
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      <span className="inline-flex items-center gap-2.5">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
