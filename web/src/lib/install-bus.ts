"use client";

/**
 * install-bus — tiny queued pub/sub between the burger-menu
 * "Install the app" entry and the InstallPwaPrompt component.
 *
 * Why not a window event: a plain dispatchEvent is fire-and-forget.
 * If InstallPwaPrompt happens to be remounting (route transition,
 * error-boundary recovery) at the exact moment the user taps, the
 * event fires into the void and NOTHING happens — which is exactly
 * what a US tester reported on iOS Safari on 2026-07-09. The bus
 * keeps a pending flag, so a subscriber that mounts AFTER the tap
 * still consumes the request and opens the install flow.
 */

let pending = false;
const subscribers = new Set<() => void>();

/** Called by the menu entry. Notifies live subscribers; if none are
 *  mounted right now, the request stays pending until one arrives. */
export function requestInstallOpen(): void {
  pending = true;
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a broken subscriber must not block the others */
    }
  });
}

/** Returns true exactly once per pending request. */
export function consumePendingInstallOpen(): boolean {
  const v = pending;
  pending = false;
  return v;
}

export function subscribeInstallOpen(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
