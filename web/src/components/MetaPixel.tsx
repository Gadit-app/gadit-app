"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { adsAllowed, isPlansPath, setAdsRoleIsKid } from "@/lib/ad-scope";

/**
 * Meta (Facebook) Pixel: base code + SPA page views.
 *
 * Created 2026-07-13 for the first paid campaigns (dataset "Gadit", LLC
 * Business Manager). The pixel ID is public by design.
 *
 * Scope (Gadi 2026-10-25, lib/ad-scope.ts): the pixel loads and sends ONLY on
 * acquisition pages (landing pages, pricing, checkout and its success page,
 * sign-in completion), never inside the logged-in app and never for a child
 * (kid profile or Kids Mode). Meta's automatic SPA page views and automatic
 * events are switched off, so leaving an acquisition page stops all hits;
 * every event goes through fbqTrack, which checks the same gate.
 *
 * Standard-event wiring lives in lib/track.ts (CompleteRegistration,
 * InitiateCheckout, StartTrial), one naming point for the funnel.
 */

export const META_PIXEL_ID = "885853537404576";

type FbqFn = ((...args: unknown[]) => void) & { disablePushState?: boolean };

function getFbq(): FbqFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { fbq?: FbqFn };
  return w.fbq ?? null;
}

// Events fired before the pixel script finishes loading are queued and
// flushed once the stub exists. (Meta's snippet bails out if window.fbq
// already exists, so we can't pre-create the stub ourselves.)
let pendingEvents: Array<[string, Record<string, unknown> | undefined]> = [];

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined" || !adsAllowed()) return;
    const fbq = getFbq();
    if (fbq) {
      fbq("track", event, params ?? {});
    } else if (pendingEvents.length < 20) {
      pendingEvents.push([event, params]);
    }
  } catch {
    // analytics must never break a user flow
  }
}

function flushPending() {
  const fbq = getFbq();
  if (!fbq) return;
  for (const [event, params] of pendingEvents) {
    try {
      if (adsAllowed()) fbq("track", event, params ?? {});
    } catch {}
  }
  pendingEvents = [];
}

export default function MetaPixel() {
  const pathname = usePathname() || "/";
  const { user, loading, planReady, familyRole } = useAuth();
  const [kidsOn] = useKidsMode();
  const [load, setLoad] = useState(false);
  const lastPath = useRef<string | null>(null);
  setAdsRoleIsKid(familyRole === "kid");
  const decided = !loading && (!user || planReady);

  // Load once the visitor is known to be an adult on an acquisition page.
  useEffect(() => {
    if (!decided || load) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-way latch (the pixel, once loaded, stays loaded)
    if (adsAllowed(pathname)) setLoad(true);
  }, [decided, load, pathname, kidsOn, familyRole]);

  // Flush queued events once the stub exists.
  useEffect(() => {
    if (!load) return;
    if (getFbq()) { flushPending(); return; }
    const timer = setInterval(() => { if (getFbq()) { flushPending(); clearInterval(timer); } }, 500);
    const stop = setTimeout(() => clearInterval(timer), 10_000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [load]);

  // Page views on SPA navigation, acquisition pages only (the base code sends
  // the first one). ViewContent on the pages that list the plans.
  useEffect(() => {
    if (!load) return;
    const first = lastPath.current === null;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!adsAllowed(pathname)) return;
    if (!first) getFbq()?.("track", "PageView");
    if (isPlansPath(pathname)) fbqTrack("ViewContent", { content_category: "plans", content_name: pathname });
  }, [load, pathname]);

  if (!load) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq.disablePushState = true;
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
