/**
 * src/components/admin/product-multi-select.js
 * A scrollable list of checkboxes for linking multiple products to a
 * project. With a search box to narrow the list when there are many products.
 *
 * The checkboxes all share the same name ("product_ids"), so the form
 * submits an array via formData.getAll("product_ids").
 *
 * The whole thing is wrapped in its own <form> with a submit button. This
 * is a separate form from the project details form, so the admin can save
 * links independently (and see success/failure clearly).
 */

"use client";

import { useActionState, useMemo, useState } from "react";
import { Search, Check, AlertCircle } from "lucide-react";

export default function ProductMultiSelect({
  action,
  products,
  selectedIds,
}) {
  const [state, formAction, pending] = useActionState(action, {});

  // Local state for which checkboxes are checked. Initialised from the
  // currently linked products.
  const [checked, setChecked] = useState(new Set(selectedIds));

  // Search filter for the list.
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full h-10 pl-10 pr-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Checkbox list */}
      <div className="border border-border rounded-md max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No products match &quot;{search}&quot;.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((product) => {
              const isChecked = checked.has(product.id);
              return (
                <li key={product.id}>
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors duration-150">
                    <input
                      type="checkbox"
                      name="product_ids"
                      value={product.id}
                      checked={isChecked}
                      onChange={() => toggle(product.id)}
                      className="sr-only peer"
                    />
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border rounded-sm transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
                        isChecked ? "bg-accent border-accent" : "border-border"
                      }`}
                    >
                      <svg
                        viewBox="0 0 12 12"
                        className={`h-2.5 w-2.5 text-accent-foreground transition-opacity duration-150 ${
                          isChecked ? "opacity-100" : "opacity-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    </span>
                    <span className="flex-1 text-sm">{product.name}</span>
                    {product.status === "draft" && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Selected count */}
      <p className="text-xs text-muted-foreground">
        {checked.size} of {products.length} linked.
      </p>

      {/* Save */}
      {state.error && (
        <div className="inline-flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-sm px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.message && (
        <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center h-10 px-5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md transition-all duration-200 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save product links"}
      </button>
    </form>
  );
}