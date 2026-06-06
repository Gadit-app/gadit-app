"use client";

import { useCallback, useRef } from "react";

/**
 * useLongPress — cross-platform 'look up this word' gesture.
 *
 * Touch (mobile):  press and hold for `ms` milliseconds without lifting
 *                  or moving the finger. Default 500ms.
 * Mouse (desktop): right-click (contextmenu). Standard 'look up' gesture
 *                  the OS uses across browsers and PDF readers.
 *
 * Both prevent their respective defaults so we don't get a native context
 * menu or a text-selection drag in the way.
 *
 * The callback receives the HTMLElement that was pressed so the caller can
 * anchor a popover to it (position: absolute relative to the element's
 * bounding rect).
 */
export function useLongPress<T extends HTMLElement = HTMLElement>(
  callback: (anchor: T) => void,
  ms = 500,
) {
  const timerRef = useRef<number | null>(null);
  // startedRef tracks whether the current press is still 'live' (no move
  // or lift yet). The timer alone isn't enough — if the user starts a
  // press, scrolls, and the touchmove cancels the timer, we still don't
  // want a stale fire to slip through if the user lifts and presses again.
  const startedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startedRef.current = false;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<T>) => {
      const target = e.currentTarget;
      startedRef.current = true;
      timerRef.current = window.setTimeout(() => {
        if (startedRef.current) {
          callback(target);
        }
      }, ms);
    },
    [callback, ms],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent<T>) => {
      // Suppress the native context menu — we're hijacking right-click
      // as the desktop equivalent of long-press.
      e.preventDefault();
      callback(e.currentTarget);
    },
    [callback],
  );

  return {
    onTouchStart,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onTouchMove: clear,
    onContextMenu,
  };
}
