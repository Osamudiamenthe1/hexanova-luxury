/**
 * src/components/admin/single-image-upload.js
 * Upload ONE image (used for project covers and, later, category images).
 *
 * Behaviour:
 *   - If there's no image yet, shows an upload button.
 *   - If there's an image, shows a preview with Replace and Remove actions.
 *   - The uploaded URL is stored in a hidden input named "name" so it
 *     submits with the form as a normal field.
 *
 * The file uploads to Supabase Storage from the browser, then the URL is
 * set as local state and passed to the server action via the hidden input.
 * The server action just stores the URL string.
 */

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { uploadMediaFile, deleteMediaFile } from "@/lib/upload";

export default function SingleImageUpload({
  name,
  label,
  help,
  initialUrl = "",
  folder = "projects",
}) {
  const [url, setUrl] = useState(initialUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const { url: newUrl } = await uploadMediaFile(file, folder);
      // If there was a previous image, best-effort delete it so we don't
      // leave orphans behind when the admin replaces a photo.
      if (url && url !== newUrl) {
        await deleteMediaFile(url);
      }
      setUrl(newUrl);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove this image?")) return;
    if (url) await deleteMediaFile(url);
    setUrl("");
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>

      {/* Hidden input carries the URL through to the server action. */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="space-y-3">
          <div className="relative w-full max-w-sm aspect-[16/10] bg-muted rounded-sm overflow-hidden">
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm text-[10px] uppercase tracking-[0.15em] border border-border hover:bg-muted/50 transition-colors duration-150 disabled:opacity-60"
            >
              <Upload className="h-3 w-3" strokeWidth={1.75} />
              {uploading ? "Uploading..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm text-[10px] uppercase tracking-[0.15em] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors duration-150 disabled:opacity-60"
            >
              <X className="h-3 w-3" strokeWidth={1.75} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2.5 h-10 px-5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium bg-accent text-accent-foreground hover:bg-accent-hover hover:-translate-y-px hover:shadow-md transition-all duration-200 disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
          {uploading ? "Uploading..." : "Upload image"}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFile}
        className="sr-only"
      />

      {help && !error && (
        <p className="mt-2 text-xs text-muted-foreground">{help}</p>
      )}

      {error && (
        <div className="mt-2 inline-flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-sm px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}