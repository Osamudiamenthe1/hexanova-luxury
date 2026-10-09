/**
 * src/components/ui/image-gallery.js
 * A product image gallery.
 *
 * Layout on desktop: large main image on the left, vertical thumbnail
 * column on the right. On mobile: main image with a horizontal strip of
 * thumbnails underneath.
 *
 * Clicking the main image opens a lightbox.
 *
 * ACCESSIBILITY:
 *   - The lightbox has role="dialog" and aria-modal="true" so screen
 *     readers announce it as a dialog.
 *   - Focus is moved to the close button on open and restored to the
 *     main image button on close, so keyboard users are never stranded.
 *   - Thumbnails mark the active one with aria-current.
 *   - Keyboard: Escape closes, ArrowLeft / ArrowRight navigate.
 *   - Touch: swipe left or right to navigate.
 *
 * IMPORTANT: All hooks must run on every render, in the same order.
 * We cannot return early before calling useEffect, so we handle the
 * "no images" case by conditionally rendering later instead.
 */

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import PlaceholderImage from "./placeholder-image";

export default function ImageGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Refs let us move focus around when the dialog opens and closes.
  const mainImageRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Swipe gesture tracking.
  const touchStartXRef = useRef(null);

  // Compute these BEFORE any return. Hooks below still run regardless.
  const hasImages = Array.isArray(images) && images.length > 0;
  const imageCount = hasImages ? images.length : 0;
  const activeImage = hasImages ? images[activeIndex] : null;

  // Keyboard controls + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen || !hasImages) return;

    function handleKey(e) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % imageCount);
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + imageCount) % imageCount);
      }
    }
    document.addEventListener("keydown", handleKey);
    // Prevent the page behind the lightbox from scrolling.
    document.body.style.overflow = "hidden";

    // Move focus to the close button so a keyboard user is inside the
    // dialog immediately, not still on the page underneath.
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, hasImages, imageCount]);

  // NOW we can branch. No more hooks below, so it's safe.
  if (!hasImages) {
    return <PlaceholderImage label={productName} aspect="aspect-[4/5]" />;
  }

  function goNext() {
    setActiveIndex((i) => (i + 1) % imageCount);
  }
  function goPrev() {
    setActiveIndex((i) => (i - 1 + imageCount) % imageCount);
  }

  function openLightbox() {
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    // Return focus to the element that opened the dialog. Because the main
    // image button is the only trigger, we just ref it directly.
    mainImageRef.current?.focus();
  }

  // --- Touch handlers (mobile swipe) ---

  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    // Ignore short taps and jitter.
    if (Math.abs(dx) < 40) return;
    if (imageCount <= 1) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-4">
        {/* Main image */}
        <button
          ref={mainImageRef}
          type="button"
          onClick={openLightbox}
          className="relative aspect-[4/5] overflow-hidden bg-muted cursor-zoom-in group"
          aria-label="Enlarge image"
        >
          <Image
            src={activeImage.image_url}
            alt={activeImage.alt_text || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            quality={70}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </button>

        {/* Thumbnails */}
        {imageCount > 1 && (
          <div className="flex lg:flex-col gap-3 order-first lg:order-last">
            {images.map((img, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  // aria-current tells a screen reader which thumbnail is
                  // currently shown in the main viewer.
                  aria-current={isActive ? "true" : undefined}
                  className={`relative w-16 lg:w-full aspect-square overflow-hidden bg-muted border-2 transition-colors duration-200 ${
                    isActive
                      ? "border-accent"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `${productName} thumbnail ${i + 1}`}
                    fill
                    sizes="80px"
                    quality={70}
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer: ${productName}`}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute top-4 right-4 h-10 w-10 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <X className="h-6 w-6" />
          </button>

          {imageCount > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="absolute left-4 h-12 w-12 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="absolute right-4 h-12 w-12 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div
            className="relative w-[90vw] h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.image_url}
              alt={activeImage.alt_text || productName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}