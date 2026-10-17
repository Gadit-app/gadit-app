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
 *
 * With `shareLabel`, a share button sits beside close: it shares (or, where
 * files cannot be shared, saves) the picture WITH the small Gadit mark
 * (lib/watermark.ts). The picture shown here stays clean; the marked copy is
 * built in the background when the viewer opens so the share sheet opens
 * straight from the tap.
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { shareWatermarkedPicture, watermarkImage } from "@/lib/watermark";

type Props = {
  src: string;
  alt: string;
  /** Optional caption, used for screen-reader context only. */
  closeLabel?: string;
  /** Shows the share button (localized "Share"). */
  shareLabel?: string;
  /** The word, for the shared title and file name. */
  word?: string;
  /** Link sent with the shared picture (the word page). */
  pageUrl?: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, closeLabel = "Close", shareLabel, word, pageUrl, onClose }: Props) {
  // Marked copy for sharing, prepared once per picture while the viewer is open.
  const markedRef = useRef<{ src: string; blob: Blob | null; pending: Promise<Blob | null> } | null>(null);
  useEffect(() => {
    if (!shareLabel || !src) return;
    const pending = watermarkImage(src).then(
      (blob) => {
        if (markedRef.current?.src === src) markedRef.current.blob = blob;
        return blob;
      },
      () => null,
    );
    markedRef.current = { src, blob: null, pending };
  }, [shareLabel, src]);

  async function handleShare() {
    const cur = markedRef.current?.src === src ? markedRef.current : null;
    // Ready: share at once. Still building: wait for it (share falls back to
    // saving the file if the browser no longer allows the share sheet).
    const ready = cur?.blob ?? (cur ? await cur.pending : null);
    await shareWatermarkedPicture({ src, word: word || alt, pageUrl, ready });
  }

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
      {shareLabel && (
        <button
          type="button"
          className="wb-lightbox-close"
          // Same round chrome as close, one step further in from the edge.
          style={{ insetInlineEnd: 68 }}
          aria-label={shareLabel}
          title={shareLabel}
          onClick={(e) => { e.stopPropagation(); void handleShare(); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
        </button>
      )}
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
