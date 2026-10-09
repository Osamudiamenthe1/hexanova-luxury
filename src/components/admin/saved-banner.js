/**
 * src/components/admin/saved-banner.js
 * A green success banner shown after a save or delete in the admin.
 *
 * Behaviour:
 *   1. Auto-dismisses after a few seconds (default 4s).
 *   2. Can be dismissed manually with the X button.
 *   3. On mount, removes "saved" and "deleted" from the URL using
 *      history.replaceState, so refreshing or bookmarking the page
 *      doesn't re-show the banner. This does NOT trigger a Next.js
 *      navigation, so nothing re-renders.
 *
 * Renders nothing when no message is passed, so pages can pass null.
 */

"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

export default function SavedBanner({ message, duration = 4000 }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;

    // Strip the query params from the URL without navigating.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("saved")) {
        url.searchParams.delete("saved");
        changed = true;
      }
      if (url.searchParams.has("deleted")) {
        url.searchParams.delete("deleted");
        changed = true;
      }
      if (changed) {
        window.history.replaceState({}, "", url.toString());
      }
    }

    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message || !visible) return null;

  return (
    <div
      role="status"
      className="animate-fade-in border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 text-sm px-4 py-3 rounded-md flex items-start gap-3"
    >
      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.75} />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="shrink-0 text-green-800/70 dark:text-green-200/70 hover:text-green-900 dark:hover:text-green-100 transition-colors"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}