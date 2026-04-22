"use client";
import { track as vercelTrack } from "@vercel/analytics";

/**
 * Wrapper around Vercel Analytics' track() that:
 * - Adds a "gadit_" prefix so events are easy to filter in the dashboard
 * - Strips out anything truthy that isn't a primitive (Vercel only accepts
 *   string | number | boolean | null as property values)
 */
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
  } catch (e) {
    // Never let analytics break user flows
    console.warn("track failed:", e);
  }
}
