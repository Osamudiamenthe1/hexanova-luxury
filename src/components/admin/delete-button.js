/**
 * src/components/admin/delete-button.js
 * A small "Delete" form that asks for confirmation before submitting.
 *
 * useActionState gives us access to whatever the server action returns.
 * Without it, a returned { error } object would be silent - the user would
 * click Delete, nothing visible would happen, and they would not know why.
 *
 * The error is displayed inline, right below the button, so the client sees
 * the reason without leaving the page.
 */

"use client";

import { useActionState } from "react";
import { Trash2, AlertCircle } from "lucide-react";

export default function DeleteButton({ action, confirmMessage }) {
  // React 19 hook: [currentState, wrappedFormAction, isPending]
  const [state, formAction, pending] = useActionState(action, {});

  function handleSubmit(event) {
    const message = confirmMessage || "Are you sure? This cannot be undone.";
    if (!window.confirm(message)) {
      // Stop the form from submitting if the user cancels.
      event.preventDefault();
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <form action={formAction} onSubmit={handleSubmit} className="inline-block">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150 disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {pending ? "Deleting..." : "Delete"}
        </button>
      </form>

      {/* Error message returned by the server action. */}
      {state?.error && (
        <div
          role="alert"
          className="mt-2 flex items-start gap-1.5 max-w-xs text-left text-[11px] leading-snug text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-sm px-2 py-1.5"
        >
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
    </div>
  );
}