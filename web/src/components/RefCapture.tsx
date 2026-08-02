"use client";

import { useEffect } from "react";

/**
 * Captures the Yooniz-style partner referral link gadit.app/?ref=<code>.
 *
 * On first mount (any page) it reads ?ref= from the URL, pings
 * /api/partner/click to record the click + drop the 60-day attribution
 * cookie, then strips ?ref= from the address bar so the URL stays clean
 * and a refresh doesn't double-count. Attribution to a paying customer
 * happens later, in /api/notify-signup, from the cookie this sets.
 *
 * Runs once, fire-and-forget — it must never block or error the page.
 */
export function RefCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref");
      if (!ref) return;
      void fetch("/api/partner/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      }).catch(() => {});
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch {
      /* never break the page over attribution */
    }
  }, []);
  return null;
}
