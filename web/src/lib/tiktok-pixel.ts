"use client";

/**
 * TikTok Pixel (browser side), Gadit. Loaded by components/TikTokPixel.tsx
 * ONLY on acquisition pages (lib/ad-scope.ts) and never for a child (a kid
 * profile or Kids Mode), never in the iOS app. Events:
 *   ViewContent (plans) · AddToCart (a plan chosen) · InitiateCheckout (the
 *   payment form) · CompleteRegistration `reg_<uid>` · StartTrial `trial_<uid>`
 * Registration and StartTrial carry the same event_id as the server Events
 * API (lib/tiktok-events.ts), so TikTok counts each once. Purchase (the first
 * real charge, after the trial) is server-only, from the Stripe webhook.
 */
import { TIKTOK_PIXEL_ID } from "./tiktok-config";
import { adsAllowed } from "./ad-scope";

export { TIKTOK_PIXEL_ID };

type TtqParams = Record<string, unknown>;

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: TtqParams, opts?: { event_id?: string }) => void;
      page: () => void;
      grantConsent?: () => void;
      revokeConsent?: () => void;
    };
    /** Set by TikTokPixel: true only on an allowed (adult) page right now. */
    __gaditTtqOn?: boolean;
  }
}

/** Where the pixel may run: the shared acquisition-page gate (lib/ad-scope.ts). */
export { isAcquisitionPath as isTikTokPath, isPlansPath as isTikTokPlansPath } from "./ad-scope";

/** Fire a standard TikTok Pixel event. Safe no-op off adult pages or without ttq. */
export function ttqTrack(event: string, params?: TtqParams, eventId?: string): void {
  if (typeof window === "undefined" || window.__gaditTtqOn !== true || !adsAllowed() || typeof window.ttq?.track !== "function") return;
  try {
    if (eventId) window.ttq.track(event, params ?? {}, { event_id: eventId });
    else window.ttq.track(event, params ?? {});
  } catch {
    /* tracking must never break the page */
  }
}

/** TikTok's product shape for a Gadit plan (Family / Individual / Schools). */
export function ttqPlanContents(plan: string, value?: number, currency?: string) {
  return {
    content_type: "product",
    contents: [
      {
        content_id: plan || "gadit",
        content_name: `Gadit ${plan || "subscription"}`,
        quantity: 1,
        ...(value && value > 0 ? { price: value } : {}),
      },
    ],
    ...(value && value > 0 ? { value } : {}),
    ...(currency ? { currency: currency.toUpperCase() } : {}),
  };
}
