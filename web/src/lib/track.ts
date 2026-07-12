"use client";
import { track as vercelTrack } from "@vercel/analytics";
import { fbqTrack } from "@/components/MetaPixel";

/**
 * Wrapper around Vercel Analytics' track() that:
 * - Adds a "gadit_" prefix so events are easy to filter in the dashboard
 * - Strips out anything truthy that isn't a primitive (Vercel only accepts
 *   string | number | boolean | null as property values)
 * - Forwards funnel milestones to the Meta Pixel as standard events, so
 *   ad campaigns optimize on real trial-starters instead of clicks.
 *   One naming point for the whole funnel: callers keep using the same
 *   product event names, the Meta mapping lives only here.
 */

// Product event → Meta standard event. Purchase (first real charge
// after the 14-day trial) happens server-side via Stripe webhook, so
// it is NOT here — that's a Conversions API job for later.
const META_STANDARD_EVENTS: Record<string, string> = {
  signup_completed: "CompleteRegistration",
  checkout_started: "InitiateCheckout",
  checkout_completed: "StartTrial",
};

export function track(
  eventName: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  try {
    const cleaned: Record<string, string | number | boolean | null> = {};
    if (properties) {
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined) continue;
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null) {
          cleaned[k] = v;
        }
      }
    }
    vercelTrack(`gadit_${eventName}`, cleaned);
    const metaEvent = META_STANDARD_EVENTS[eventName];
    if (metaEvent) fbqTrack(metaEvent, cleaned);
  } catch (e) {
    // Never let analytics break user flows
    console.warn("track failed:", e);
  }
}
