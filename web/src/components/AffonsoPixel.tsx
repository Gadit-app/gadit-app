"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { adsAllowed } from "@/lib/ad-scope";
import { arrivedWithAffiliateParam, ensureAffonsoPixel } from "@/lib/affonso";

/**
 * Affonso affiliate pixel, landing pages only (Gadi 2026-11-10). See lib/affonso.ts.
 * Never for a child (kid profile or Kids Mode), never inside the logged-in app.
 */
export default function AffonsoPixel() {
  const pathname = usePathname() || "/";
  const { user, loading, planReady, familyRole } = useAuth();
  const [kidsOn] = useKidsMode();
  const [loaded, setLoaded] = useState(false);
  const decided = !loading && (!user || planReady);

  useEffect(() => {
    if (!decided || loaded) return;
    if (familyRole === "kid" || kidsOn) return;
    if (adsAllowed(pathname) || arrivedWithAffiliateParam()) {
      ensureAffonsoPixel();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-way latch (the pixel, once loaded, stays loaded)
      setLoaded(true);
    }
  }, [decided, loaded, pathname, kidsOn, familyRole]);

  return null;
}
