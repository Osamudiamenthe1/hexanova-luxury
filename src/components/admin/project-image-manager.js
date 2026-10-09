/**
 * src/components/admin/project-image-manager.js
 * Gallery manager for a project. Same layout and mobile-first design as
 * the product image manager, with "caption" instead of "alt text".
 *
 * LAYOUT (mobile-first, no overlap at any width):
 *   Row 1: thumbnail + caption label + input + save (stacked on mobile)
 *   Row 2: reorder arrows on the left, delete on the right
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
  addProjectImage,
  deleteProjectImage,
  updateProjectImageCaption,
  reorderProjectImage,
} from "@/lib/actions/projects";

export default function ProjectImageManager({ projectId, images }) {
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
        const { url } = await uploadMediaFile(file, "projects");
        const result = await addProjectImage(projectId, url, "");
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
      await deleteProjectImage(image.id, image.image_url);
      router.refresh();
    });
  }

  function handleReorder(image, direction) {
    startTransition(async () => {
      await reorderProjectImage(image.id, direction);
      router.refresh();
    });
  }

  function handleCaptionSave(imageId, caption) {
    startTransition(async () => {
      await updateProjectImageCaption(imageId, caption);
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
          id="project-image-upload"
        />
        <label
          htmlFor="project-image-upload"
          className={`inline-flex items-center gap-2.5 h-10 px-5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer transition-all duration-200 ${
            uploading || pending
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md"
          }`}
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
          {uploading ? "Uploading..." : "Upload gallery images"}
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

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No gallery images yet. The first image will appear large on the
          project page.
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
              onCaptionSave={handleCaptionSave}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One image row. Vertical layout at every width so nothing gets squeezed.
 */
function ImageRow({
  image,
  isFirst,
  isLast,
  pending,
  onDelete,
  onReorder,
  onCaptionSave,
}) {
  const [caption, setCaption] = useState(image.caption || "");
  const [saved, setSaved] = useState(false);

  const dirty = caption !== (image.caption || "");

  function handleSave() {
    onCaptionSave(image.id, caption);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <li className="border border-border rounded-md p-4 space-y-4">
      {/* ---- Row 1: thumbnail + caption ---- */}
      <div className="flex gap-3 items-start">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-muted overflow-hidden rounded-sm">
          <Image
            src={image.image_url}
            alt={image.caption || "Project image"}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label
              htmlFor={`caption-${image.id}`}
              className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            >
              Caption
            </label>
            {isFirst && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-accent">
                · Hero
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id={`caption-${image.id}`}
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption shown on the project page"
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