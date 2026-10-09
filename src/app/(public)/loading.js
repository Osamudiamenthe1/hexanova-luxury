/**
 * src/app/(public)/loading.js
 * Shown briefly while a public page is fetching data.
 *
 * Next.js 15 uses this as a Suspense fallback around each public page.
 * Keeping it simple and calm so it feels like part of the design rather
 * than a "waiting for the page" screen.
 */

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* A quiet spinner that respects prefers-reduced-motion via CSS. */}
        <span
          aria-hidden="true"
          className="h-6 w-6 rounded-full border-2 border-border border-t-accent animate-spin"
        />
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}