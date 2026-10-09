/**
 * src/app/admin/enquiries/[id]/status-form.js
 * Small form to change an enquiry's status.
 *
 * Uses our CustomSelect for the dropdown so it matches the rest of the
 * admin. Shows success/error inline.
 */

"use client";

import { useActionState, useState } from "react";
import CustomSelect from "@/components/ui/custom-select";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export default function EnquiryStatusForm({ action, currentStatus }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [status, setStatus] = useState(currentStatus || "new");

  const dirty = status !== currentStatus;

  return (
    <form action={formAction} className="space-y-4 max-w-xs">
      <CustomSelect
        id="status"
        name="status"
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
      />

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.message && (
        <p className="text-sm text-green-700 dark:text-green-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || !dirty}
        className="inline-flex items-center justify-center h-10 px-5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
      >
        {pending ? "Saving..." : "Save status"}
      </button>
    </form>
  );
}