/**
 * src/components/admin/checkbox-field.js
 * A labelled checkbox, controlled by the parent's state.
 *
 * Controlled (not defaultChecked) so the value survives a Server Action
 * error. React 19 resets uncontrolled inputs after a submission.
 */

"use client";

export default function CheckboxField({
  label,
  name,
  checked,
  onChange,
  help,
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center border rounded-sm transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
          checked ? "bg-accent border-accent" : "border-border"
        }`}
      >
        <svg
          viewBox="0 0 12 12"
          className={`h-2.5 w-2.5 text-accent-foreground transition-opacity duration-150 ${
            checked ? "opacity-100" : "opacity-0"
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
      <span className="flex-1">
        <span className="block text-sm">{label}</span>
        {help && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {help}
          </span>
        )}
      </span>
    </label>
  );
}