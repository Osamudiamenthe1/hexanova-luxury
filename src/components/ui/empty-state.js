/**
 * src/components/ui/empty-state.js
 * Friendly placeholder shown when a list, filter, or search returns nothing.
 *
 * Layout: a short serif heading, one line of explanation, and an optional
 * action (usually a link back to the unfiltered list).
 */

import Link from "next/link";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`text-center py-20 px-4 border border-border rounded-lg bg-card/40 ${className}`}
    >
      <h3 className="font-heading text-2xl mb-3">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center text-sm text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}