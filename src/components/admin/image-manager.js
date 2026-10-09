/**
 * src/components/admin/image-manager.js
 * Upload, preview, reorder, edit alt text, and delete product images.
 *
 * Client component because it handles file selection and uploads directly
 * to Supabase Storage (see src/lib/upload.js for why).
 *
 * LAYOUT: each row is designed mobile-first.
 *   - On mobile: thumbnail + alt-text on top, actions row below.
 *   - On desktop: the same stacking, with the input taking the full width
 *     beside the thumbnail.
 * No element is ever squeezed into a shared horizontal slot, so nothing
 * overlaps or feels cramped at narrow widths.
 *
 * All mutations go through server actions. After each action we call
 * router.refresh() to refetch the page from the server.
 */

"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  AlertCircle,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/upload";
import {
  addProductImage,
  deleteProductImage,
  updateImageAlt,
  reorderProductImage,
} from "@/lib/actions/products";

export default function ImageManager({ productId, images }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    let firstError = "";
    for (const file of files) {
      try {
        const { url } = await uploadMediaFile(file, "products");
        const result = await addProductImage(productId, url, "");
        if (result?.error && !firstError) firstError = result.error;
      } catch (err) {
        if (!firstError) firstError = err.message || "Upload failed.";
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (firstError) setUploadError(firstError);
    router.refresh();
  }

  function handleDelete(image) {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteProductImage(image.id, image.image_url);
      router.refresh();
    });
  }

  function handleReorder(image, direction) {
    startTransition(async () => {
      await reorderProductImage(image.id, direction);
      router.refresh();
    });
  }

  function handleAltSave(imageId, altText) {
    startTransition(async () => {
      await updateImageAlt(imageId, altText);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="border border-dashed border-border rounded-md p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFiles}
          disabled={uploading || pending}
          className="sr-only"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`inline-flex items-center gap-2.5 h-10 px-5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer transition-colors duration-200 ${
            uploading || pending
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md"
          }`}
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
          {uploading ? "Uploading..." : "Upload images"}
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          JPEG, PNG, WebP, or AVIF. Max 5 MB per file. Multiple allowed.
        </p>

        {uploadError && (
          <div className="mt-4 inline-flex items-start gap-1.5 text-left text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-sm px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Image list */}
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No images yet. Upload some above to give this product a proper
          gallery.
        </p>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <ImageRow
              key={image.id}
              image={image}
              isFirst={index === 0}
              isLast={index === images.length - 1}
              pending={pending}
              onDelete={handleDelete}
              onReorder={handleReorder}
              onAltSave={handleAltSave}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One image row. Layout is vertical on all widths so nothing gets squeezed:
 *   Row 1: thumbnail  +  alt-text label, input, save button
 *   Row 2: reorder controls + delete, on their own line
 */
function ImageRow({
  image,
  isFirst,
  isLast,
  pending,
  onDelete,
  onReorder,
  onAltSave,
}) {
  const [altText, setAltText] = useState(image.alt_text || "");
  const [saved, setSaved] = useState(false);

  const dirty = altText !== (image.alt_text || "");

  function handleSave() {
    onAltSave(image.id, altText);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <li className="border border-border rounded-md p-4 space-y-4">
      {/* ---- Row 1: thumbnail + alt text ---- */}
      <div className="flex gap-3 items-start">
        {/* Thumbnail. Slightly smaller on mobile so the alt field has room. */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-muted overflow-hidden rounded-sm">
          <Image
            src={image.image_url}
            alt={image.alt_text || "Product image"}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        {/* Alt text label + input + save */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label
              htmlFor={`alt-${image.id}`}
              className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            >
              Alt text
            </label>
            {isFirst && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-accent">
                · Primary
              </span>
            )}
          </div>

          {/* Stacked on mobile, side-by-side from sm up. */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id={`alt-${image.id}`}
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility and SEO"
              className="w-full sm:flex-1 h-10 px-3 border border-border bg-background rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 shrink-0 rounded-sm text-[10px] uppercase tracking-[0.15em] bg-accent text-accent-foreground hover:bg-accent-hover transition-colors duration-150"
              >
                <Save className="h-3 w-3" strokeWidth={1.75} />
                {saved ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Row 2: reorder + delete ---- */}
      {/* This row owns its own line, so nothing overlaps the input above. */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/60">
        <button
          type="button"
          disabled={isFirst || pending}
          onClick={() => onReorder(image, "up")}
          aria-label="Move up"
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150"
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          disabled={isLast || pending}
          onClick={() => onReorder(image, "down")}
          aria-label="Move down"
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150"
        >
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        {/* Push delete to the right on wider screens. */}
        <div className="flex-1" />

        <button
          type="button"
          disabled={pending}
          onClick={() => onDelete(image)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-sm text-[10px] uppercase tracking-[0.15em] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60 transition-colors duration-150"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.75} />
          Delete
        </button>
      </div>
    </li>
  );
}