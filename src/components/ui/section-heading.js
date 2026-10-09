/**
 * src/components/ui/section-heading.js
 * A consistent heading block for the top of a page section.
 *
 * Layout:
 *   [eyebrow label in caps]        optional, tiny uppercase line above
 *   Big serif heading
 *   Optional paragraph below
 *
 * Pass "align" to center everything or keep it left-aligned.
 */

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`${isCenter ? "text-center mx-auto max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="text-display-sm font-heading mb-4">{title}</h2>
      )}

      {description && (
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}