/**
 * src/components/ui/placeholder-image.js
 * A neutral block shown wherever an image is missing.
 *
 * Why? Because at launch the client will not have photos for every product.
 * Rather than crash or show a broken icon, we render this calm placeholder.
 * Once a real image is available in Supabase, the ProductCard and similar
 * components switch to <Image> automatically.
 *
 * Pass "aspect" to make it match the surrounding image (e.g. "aspect-[4/5]").
 */

export default function PlaceholderImage({
  label = "Image coming soon",
  aspect = "aspect-[4/5]",
  className = "",
}) {
  return (
    <div
      className={`relative w-full ${aspect} bg-muted flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={label}
    >
      {/* A soft diagonal texture so it doesn't look like a plain block. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 12px, rgba(0,0,0,0.03) 12px 13px)",
        }}
      />
      <span className="relative text-xs uppercase tracking-[0.2em] text-muted-foreground px-4 text-center">
        {label}
      </span>
    </div>
  );
}