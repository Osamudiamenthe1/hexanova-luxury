/**
 * src/components/ui/pagination.js
 * Simple numbered pagination for product and project listings.
 *
 * Renders as plain links. No JavaScript. Works with the URL so pages are
 * shareable and SEO-friendly.
 *
 * Props:
 *   - currentPage: the page number shown right now (1-based)
 *   - totalPages:  total number of pages
 *   - basePath:    the path to build URLs against (e.g. "/products")
 *   - searchParams: object of current query params to preserve
 *                   (so filters stay applied across pages)
 *
 * If there's only one page, this renders nothing.
 */

import Link from "next/link";
import clsx from "clsx";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}) {
  if (totalPages <= 1) return null;

  // Build a URL for a given page, keeping any existing filters.
  function hrefFor(page) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });
    // Always set the page param, even on page 1 (harmless and predictable).
    params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  // Build a compact page-number list: first, last, current, and 1 away.
  // Everything else becomes "…".
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-center gap-1"
    >
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Prev
        </Link>
      )}

      {pages.map((entry, i) => {
        if (entry === "…") {
          return (
            <span
              key={`gap-${i}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const isCurrent = entry === currentPage;
        return (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-current={isCurrent ? "page" : undefined}
            className={clsx(
              "min-w-9 px-3 py-2 text-sm text-center rounded-md transition-colors duration-150",
              isCurrent
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            {entry}
          </Link>
        );
      })}

      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

/**
 * Build a short list of page numbers, using "…" for gaps.
 * Example for page 5 of 12: [1, "…", 4, 5, 6, "…", 12]
 */
function buildPageList(current, total) {
  const delta = 1; // how many neighbours on each side of the current page
  const range = [];
  const rangeWithDots = [];
  let lastAdded;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (lastAdded !== undefined) {
      if (i - lastAdded === 2) {
        // No gap of one, just add the middle number.
        rangeWithDots.push(lastAdded + 1);
      } else if (i - lastAdded > 2) {
        rangeWithDots.push("…");
      }
    }
    rangeWithDots.push(i);
    lastAdded = i;
  }

  return rangeWithDots;
}