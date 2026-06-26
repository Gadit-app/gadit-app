"use client";

/**
 * ImageLightbox — fullscreen modal that shows the generated word image
 * at its native size against a dark backdrop, like an iOS Photos viewer.
 *
 * Triggered by tapping the inline image in a meaning card. Closes on:
 *   - Escape key
 *   - Click outside the image (on the backdrop)
 *   - The explicit close button
 *
 * Portal-mounted so its fixed positioning isn't trapped by the result
 * card's transform/overflow. Locks body scroll while open so the
 * background page doesn't drift when the user swipes inside the lightbox.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  alt: string;
  /** Optional caption, used for screen-reader context only. */
  closeLabel?: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, closeLabel = "Close", onClose }: Props) {
  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Body scroll lock — prevents the page behind from drifting when the
  // user pinches or pans the image. Restores the previous overflow on
  // unmount so the page is left exactly as it was.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="wb-lightbox"
      onClick={onClose}
    >
      <button
        type="button"
        className="wb-lightbox-close"
        aria-label={closeLabel}
        title={closeLabel}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M5 5l12 12M17 5l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className="wb-lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
