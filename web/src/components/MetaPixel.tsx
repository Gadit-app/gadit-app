"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Meta (Facebook) Pixel — base code + SPA route tracking.
 *
 * Created 2026-07-13 for the first paid campaigns (dataset "Gadit",
 * created in the LLC's Business Manager). The pixel ID is public by
 * design (it ships in every page's HTML), so it lives here as a
 * constant rather than an env var.
 *
 * Kid-safety carve-out: classroom routes (/c/<CODE>, with or without
 * a language prefix) never load the pixel and never emit events.
 * Those pages are used by children on shared school devices; tracking
 * them would contradict the product's whole child-safety positioning
 * (and COPPA). The check runs both at mount (no base code on direct
 * kid-page loads) and per-event (no events after SPA navigation into
 * a kid route).
 *
 * Standard-event wiring lives in lib/track.ts — every product event
 * that maps to a Meta standard event (CompleteRegistration,
 * InitiateCheckout, StartTrial) is forwarded from there, so there is
 * exactly one place funnel events are named.
 */

export const META_PIXEL_ID = "885853537404576";

function isKidRoute(path: string): boolean {
  return /^\/(?:[a-z]{2}\/)?c(?:\/|$)/.test(path);
}

function isWordRoute(path: string): boolean {
  return /^\/(?:[a-z]{2}\/)?word\//.test(path);
}

type FbqFn = (...args: unknown[]) => void;

function getFbq(): FbqFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { fbq?: FbqFn };
  return w.fbq ?? null;
}

// Events fired before the pixel script finishes loading are queued and
// flushed from the Script onLoad callback. (We can't pre-create Meta's
// fbq stub ourselves: the official snippet bails out if window.fbq
// already exists and the real library would never load.)
let pendingEvents: Array<[string, Record<string, unknown> | undefined]> = [];

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    if (isKidRoute(window.location.pathname)) return;
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
      fbq("track", event, params ?? {});
    } catch {}
  }
  pendingEvents = [];
}

export default function MetaPixel() {
  const pathname = usePathname();
  const initialPath = useRef<string | null>(null);
  if (initialPath.current === null) initialPath.current = pathname;

  // Flush queued events once the stub exists. onLoad doesn't fire for
  // inline <Script> children, so a short poll is the reliable option:
  // the stub appears the moment the inline snippet runs (independent
  // of the network fetch of fbevents.js, which the stub queues for).
  useEffect(() => {
    if (getFbq()) {
      flushPending();
      return;
    }
    const timer = setInterval(() => {
      if (getFbq()) {
        flushPending();
        clearInterval(timer);
      }
    }, 500);
    const stop = setTimeout(() => clearInterval(timer), 10_000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, []);

  // SPA navigations: the base snippet only covers the first page.
  useEffect(() => {
    if (pathname === initialPath.current) return;
    if (isKidRoute(pathname)) return;
    getFbq()?.("track", "PageView");
  }, [pathname]);

  // ViewContent on word pages — the "someone actually consumed the
  // product" signal Meta optimizes toward, fired on first load and on
  // client-side navigation alike.
  useEffect(() => {
    if (!isWordRoute(pathname)) return;
    const word = decodeURIComponent(pathname.split("/").pop() ?? "");
    fbqTrack("ViewContent", { content_name: word, content_category: "word" });
  }, [pathname]);

  // Direct landings on kid classroom pages get no pixel at all.
  if (isKidRoute(pathname)) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
