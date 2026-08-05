"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps every user on the latest deploy with NO manual refresh (Gadi
 * 2026-08-05: users should never need to clear cache or reload).
 *
 * The build id is baked into the bundle at build time (NEXT_PUBLIC_BUILD_ID
 * = the commit SHA). We ask the server for the LIVE build id (/api/version,
 * never cached) and, when it differs, reload the page. Reloads only happen
 * at safe moments, when the user (re)opens or focuses the tab, never
 * mid-interaction, and a reload keeps the current URL so they land back on
 * the exact same screen.
 *
 * Freshness of the reloaded page is handled by the network-first HTML
 * strategy in sw.js plus content-hashed Next chunks: the new HTML points at
 * new filenames, which are fetched fresh.
 */
const CURRENT = process.env.NEXT_PUBLIC_BUILD_ID;

export function AutoUpdater() {
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (!CURRENT || CURRENT === "dev") return;
    let cancelled = false;

    async function check() {
      if (reloadingRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { v?: string };
        if (cancelled || !data.v || data.v === "dev") return;
        if (data.v !== CURRENT) {
          reloadingRef.current = true;
          window.location.reload();
        }
      } catch {
        /* offline or transient — try again next time */
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    const first = window.setTimeout(check, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  return null;
}
