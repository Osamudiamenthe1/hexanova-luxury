/**
 * src/components/ui/product-filters.js
 * The filter bar above the shop grid.
 *
 * LAYOUT:
 *   - Desktop (sm and up): all fields visible in a grid. Same as before.
 *   - Mobile (< sm): Search and Sort stay visible. Category, Collection,
 *     and Price are moved behind a "Filters" button that expands a panel.
 *     The button shows a count badge when any of those are active.
 *
 * All filter state lives in the URL. When the user changes a filter, we
 * build a new query string and navigate to it. That keeps the URL
 * shareable, makes the back button work, and lets the server render the
 * filtered results.
 *
 * The dropdowns use our CustomSelect component because native <select>
 * elements cannot be styled and can overflow their container on mobile.
 */

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import CustomSelect from "./custom-select";

export default function ProductFilters({ categories, collections, hide }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for the text/number inputs so typing feels instant. These
  // only push to the URL on submit, not on every keystroke.
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Whether the mobile "advanced filters" panel is open.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // If the URL changes from elsewhere (e.g. user clicked "Clear all"), keep
  // the input fields in sync.
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    // Any filter change resets to page 1.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  // Dropdowns navigate immediately when an option is picked.
  function handleSelect(key, value) {
    updateParams({ [key]: value || null });
  }

  // Text inputs and price fields navigate on submit.
  function handleSubmit(event) {
    event.preventDefault();
    updateParams({
      search: search || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
    // Close the mobile panel after applying.
    setFiltersOpen(false);
  }

  function handleClearAll() {
    setFiltersOpen(false);
    router.push(pathname);
  }

  const hasAnyFilter =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("collection") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice") ||
    searchParams.get("sort");

  // How many of the "advanced" filters (category, collection, price) are
  // set? Used for the count badge on the mobile Filters button.
  const advancedFilterCount = [
    searchParams.get("category"),
    searchParams.get("collection"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
  ].filter(Boolean).length;

  // Build the option lists for our custom dropdowns.
  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];
  const collectionOptions = [
    { value: "", label: "All collections" },
    ...collections.map((c) => ({ value: c.slug, label: c.name })),
  ];
  const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "featured", label: "Featured first" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
  ];

  return (
    <div className="mb-12 border-y border-border py-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Search + Sort. Always visible on every screen. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!hide?.includes("search") && (
            <div>
              <label
                htmlFor="filter-search"
                className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="filter-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Product name, material, or category"
                  className="w-full h-11 pl-10 pr-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {!hide?.includes("sort") && (
            <div>
              <label
                htmlFor="filter-sort"
                className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                Sort by
              </label>
              <CustomSelect
                id="filter-sort"
                value={searchParams.get("sort") || "newest"}
                onChange={(v) => handleSelect("sort", v)}
                options={sortOptions}
              />
            </div>
          )}
        </div>

        {/* Mobile-only "Filters" button. Hidden on sm and up, where the
            advanced fields below are always visible. */}
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="advanced-filters-panel"
          className="sm:hidden w-full flex items-center justify-between h-11 px-4 border border-border bg-background rounded-md text-sm hover:border-foreground/40 transition-colors duration-200"
        >
          <span className="flex items-center gap-2">
            Filters
            {advancedFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-medium">
                {advancedFilterCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              filtersOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Advanced fields: Category, Collection, Price.
            - On mobile: hidden unless the Filters button is open.
            - On sm and up: always visible. */}
        <div
          id="advanced-filters-panel"
          className={filtersOpen ? "block" : "hidden sm:block"}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 sm:pt-0">
            {!hide?.includes("category") && categories.length > 0 && (
              <div>
                <label
                  htmlFor="filter-category"
                  className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Category
                </label>
                <CustomSelect
                  id="filter-category"
                  value={searchParams.get("category") || ""}
                  onChange={(v) => handleSelect("category", v)}
                  options={categoryOptions}
                />
              </div>
            )}

            {!hide?.includes("collection") && collections.length > 0 && (
              <div>
                <label
                  htmlFor="filter-collection"
                  className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Collection
                </label>
                <CustomSelect
                  id="filter-collection"
                  value={searchParams.get("collection") || ""}
                  onChange={(v) => handleSelect("collection", v)}
                  options={collectionOptions}
                />
              </div>
            )}

            {!hide?.includes("price") && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Price (₦)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions row. Clear all + Apply, aligned right. */}
        <div className="flex gap-3 justify-end items-center">
          {hasAnyFilter && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 link-underline"
            >
              Clear all filters
            </button>
          )}
          {(!hide?.includes("search") || !hide?.includes("price")) && (
            <button
              type="submit"
              className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-hover hover:-translate-y-px hover:shadow-md transition-all duration-200"
            >
              Apply filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}