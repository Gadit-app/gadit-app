"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { GA_ID, gaAllowed, setGaDisabled, setGaRoleIsKid, installGaHistoryGuard } from "@/lib/ga";

/**
 * Google Analytics 4 (property "Gadit", 536960305). Gadi 2026-10-06: the
 * property had 0 sessions because the tag was never installed; Vercel
 * Analytics stays alongside it.
 *
 * Kid-safety carve-out, the same policy as the Meta Pixel: GA never loads and
 * never sends a hit while a child is using Gadit. That means
 *   - kid routes: /c/<CODE> (classroom), /kids (shared-device switcher),
 *     /spell (the kids' dictation trainer), with or without a language prefix;
 *   - a kid session (familyRole === "kid");
 *   - Kids Mode switched on.
 * GA is loaded only once one of those is known NOT to be true (for a
 * signed-in user that waits for the plan/role snapshot). If the context turns
 * into a kid one later (a parent flips Kids Mode, or navigates into /kids),
 * the official `ga-disable-<ID>` switch stops every hit until it ends. The
 * history guard below flips that switch synchronously on navigation, before
 * GA's own history listener can record a kid page view.
 */

export default function GoogleAnalytics() {
  const { user, loading, planReady, familyRole } = useAuth();
  const [kidsOn] = useKidsMode();
  const pathname = usePathname();
  const [load, setLoad] = useState(false);
  const lastAllowed = useRef<boolean | null>(null);

  setGaRoleIsKid(familyRole === "kid");
  // Undecided until auth (and, for a signed-in user, the role) has resolved.
  const decided = !loading && (!user || planReady);

  useEffect(() => {
    if (!decided) return;
    // Same test the event helper uses (kidsOn / pathname are the triggers).
    const allowed = gaAllowed();
    if (lastAllowed.current === allowed) return;
    lastAllowed.current = allowed;
    setGaDisabled(!allowed);
    if (allowed) {
      installGaHistoryGuard();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-way latch (GA, once loaded, stays loaded)
      setLoad(true);
    }
  }, [decided, kidsOn, pathname, familyRole]);

  if (!load) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
