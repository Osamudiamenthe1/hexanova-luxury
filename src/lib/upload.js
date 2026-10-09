/**
 * src/lib/upload.js
 * Client-side helper for uploading files directly to Supabase Storage.
 *
 * WHY BROWSER-SIDE?
 * Server Actions have a body-size limit (1 MB by default on Vercel). Photos
 * are much bigger than that. Uploading from the browser goes straight to
 * Supabase, skipping Next.js entirely.
 *
 * WHY DOWNSCALE BEFORE UPLOAD?
 * A photo straight off a camera or phone is often 3000-5000 pixels wide
 * and several megabytes. At the sizes we display, anything over ~2000px
 * on the longest side is wasted bytes - visible only if the visitor zooms
 * in further than any human actually does. We resize to 2000px in the
 * browser before uploading. That cuts file size by 60-80% with no visible
 * difference. Files already smaller than 2000px are uploaded untouched.
 *
 * SECURITY: the upload still requires a signed-in admin session. Supabase
 * Storage uses the same Row Level Security rules as the database, so a
 * logged-out user cannot upload even if they somehow call this file.
 *
 * USAGE (only from a "use client" file):
 *   import { uploadMediaFile, deleteMediaFile } from "@/lib/upload";
 *   const { url, path } = await uploadMediaFile(file, "products");
 */

"use client";

import { createClient } from "@/lib/supabase/browser";

// Allowed image types. Anything else is rejected before upload.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// 5 MB max, matching the bucket's limit.
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Downscale settings. 2000px keeps plenty of detail for retina laptops
// and modern phones, without shipping bytes no one will ever see.
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

/**
 * Figure out the correct file extension for a given MIME type. Used when
 * we build the storage path so the extension matches the actual bytes.
 */
function extensionForMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

/**
 * Downscale an image file in the browser using a canvas.
 * Returns a File (untouched, if already small enough) or a Blob ready
 * to upload.
 *
 * Format rules:
 *   - PNG stays PNG, so transparency survives.
 *   - Everything else is re-encoded as WebP. Modern browsers and the
 *     Supabase bucket both accept WebP, and it is 25-35% smaller than
 *     JPEG at the same visual quality.
 *
 * If anything goes wrong (canvas unavailable, decode failure), we return
 * the original file - the upload still succeeds, just with the original
 * bytes.
 */
async function downscaleImage(file, maxDimension, quality) {
  // Object URLs are cheaper than reading the file as a data URL.
  const objectUrl = URL.createObjectURL(file);

  try {
    // Decode the image into an <img> we can read dimensions from.
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not decode the image."));
      image.src = objectUrl;
    });

    const { width, height } = img;
    const longest = Math.max(width, height);

    // Already small enough - upload the original bytes untouched.
    if (longest <= maxDimension) {
      return file;
    }

    // Scale down so the longest side equals maxDimension.
    const scale = maxDimension / longest;
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file; // extremely rare; fall back to the original

    // Better downscaling quality where the browser supports it.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const isPng = file.type === "image/png";
    const outputType = isPng ? "image/png" : "image/webp";

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        outputType,
        // PNG ignores the quality argument; WebP uses it.
        isPng ? undefined : quality
      );
    });

    return blob || file;
  } finally {
    // Always revoke, even on the early-return path.
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Upload a single file to the "media" bucket.
 *
 * @param {File} file        - The file from an <input type="file">
 * @param {string} folder    - "products", "projects", "categories", etc.
 * @returns {Promise<{ url: string, path: string }>}
 * @throws {Error}           - With a message suitable to show the admin
 */
export async function uploadMediaFile(file, folder) {
  // Validate type.
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `"${file.name}" is not a supported image. Use JPEG, PNG, WebP, or AVIF.`
    );
  }

  // Validate size. We check before downscaling so a 50 MB upload fails
  // fast rather than after we've done the decode work.
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`"${file.name}" is ${mb} MB. The maximum is 5 MB.`);
  }

  // Downscale in the browser. Any failure falls back to the original file
  // so the upload still succeeds.
  let uploadBlob;
  try {
    uploadBlob = await downscaleImage(file, MAX_DIMENSION, JPEG_QUALITY);
  } catch (err) {
    console.error("downscaleImage error:", err);
    uploadBlob = file;
  }

  // The extension must match the actual bytes we send, not the original
  // filename. A JPEG we re-encoded to WebP needs a ".webp" extension.
  const mime = uploadBlob.type || file.type;
  const extension = extensionForMime(mime);
  const uniqueName = `${crypto.randomUUID()}.${extension}`;
  const path = `${folder}/${uniqueName}`;

  const supabase = createClient();

  // Upload the bytes.
  const { error } = await supabase.storage
    .from("media")
    .upload(path, uploadBlob, { upsert: false, contentType: mime });

  if (error) {
    console.error("uploadMediaFile error:", error.message);
    throw new Error("Upload failed. Please check your connection and try again.");
  }

  // Ask Supabase for the public URL of the file we just uploaded.
  const { data } = supabase.storage.from("media").getPublicUrl(path);

  return { url: data.publicUrl, path };
}

/**
 * Delete a file from the "media" bucket.
 * Called when an image record is removed so we don't leave orphans.
 *
 * @param {string} url - The public URL stored in the database.
 */
export async function deleteMediaFile(url) {
  // Extract the storage path from the public URL.
  // The URL looks like: https://xxx.supabase.co/storage/v1/object/public/media/products/uuid.jpg
  const marker = "/storage/v1/object/public/media/";
  const index = url.indexOf(marker);
  if (index === -1) {
    // Not one of ours (maybe a placeholder or external image). Nothing to do.
    return;
  }
  const path = url.slice(index + marker.length);

  const supabase = createClient();
  const { error } = await supabase.storage.from("media").remove([path]);

  if (error) {
    // Log it but don't throw - the DB row deletion should still succeed
    // even if the storage delete fails (the client can clean up manually).
    console.error("deleteMediaFile error:", error.message);
  }
}