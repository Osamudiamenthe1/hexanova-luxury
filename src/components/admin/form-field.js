/**
 * src/components/admin/form-field.js
 * Small, reusable form fields for the admin.
 *
 * Both components support BOTH modes:
 *   - Uncontrolled: pass "defaultValue" (or nothing).
 *   - Controlled:   pass "value" and "onChange".
 *
 * ProductForm uses the controlled mode for every field, because React 19
 * resets uncontrolled inputs after a Server Action runs - which would
 * wipe everything the admin typed when they hit a validation error.
 */

export function Input({
  label,
  name,
  type = "text",
  required = false,
  help,
  defaultValue,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {help && <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  required = false,
  rows = 5,
  help,
  defaultValue,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />
      {help && <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}