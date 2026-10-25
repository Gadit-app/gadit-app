"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { isIosApp } from "@/lib/native-app";
import { TIKTOK_PIXEL_ID, isTikTokPath, isTikTokPlansPath, ttqTrack, ttqPlanContents } from "@/lib/tiktok-pixel";

/**
 * TikTok Pixel loader (official base code), Gadit, 2026-10-25.
 *
 * Scope (lib/ad-scope.ts, shared with the Meta Pixel and GA): acquisition
 * pages only (landing pages, pricing, checkout and its success page, sign-in
 * completion), never inside the logged-in app, never for a kid profile, in
 * Kids Mode or inside the iOS app. window.__gaditTtqOn and the consent switch
 * stop every hit the moment the visitor leaves an acquisition page.
 *
 * A TikTok ad click (?ttclid=) is kept in a first-party cookie, so the server
 * Events API can attribute the signup and the payment that follow.
 */
export default function TikTokPixel() {
  const pathname = usePathname() || "/";
  const { user, loading, planReady, familyRole } = useAuth();
  const [kidsOn] = useKidsMode();
  const [load, setLoad] = useState(false);
  const firstPage = useRef(true);
  const viewed = useRef<string>("");

  const kid = familyRole === "kid" || kidsOn;
  const decided = !loading && (!user || planReady);
  const allowed = decided && !kid && isTikTokPath(pathname);

  // The ad click id, wherever the visitor lands (first-party, 30 days).
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("ttclid");
      if (id) document.cookie = `gadit_ttclid=${encodeURIComponent(id)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch { /* ignore */ }
  }, [pathname]);

  useEffect(() => {
    let ios = false;
    try { ios = isIosApp(); } catch { /* ignore */ }
    window.__gaditTtqOn = allowed && !ios;
    // Leaving an acquisition page: TikTok's consent switch stops every hit,
    // including any automatic ones, until the visitor is back on one.
    try { if (window.__gaditTtqOn) window.ttq?.grantConsent?.(); else window.ttq?.revokeConsent?.(); } catch { /* ignore */ }
    if (!window.__gaditTtqOn) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-way latch (the pixel, once loaded, stays loaded)
    if (!load) { setLoad(true); return; } // the base code sends the first page view
    if (firstPage.current) { firstPage.current = false; }
    else { try { window.ttq?.page(); } catch { /* ignore */ } }
  }, [allowed, load, pathname]);

  // ViewContent: a visit to a page that lists the plans.
  useEffect(() => {
    if (!load || !allowed || !isTikTokPlansPath(pathname) || viewed.current === pathname) return;
    viewed.current = pathname;
    const plan = /families/.test(pathname) ? "family" : /individuals/.test(pathname) ? "individual" : /schools/.test(pathname) ? "schools" : "plans";
    setTimeout(() => ttqTrack("ViewContent", { ...ttqPlanContents(plan), content_name: `Gadit ${plan}` }), 800);
  }, [load, allowed, pathname]);

  if (!load) return null;
  return (
    <Script id="tiktok-pixel-init" strategy="afterInteractive">
      {`
        if (!/GaditApp-iOS/.test(navigator.userAgent) && !(window.GaditNative && window.GaditNative.platform === "ios")) {
        !function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)}; ttq.load('${TIKTOK_PIXEL_ID}'); ttq.page(); }(window, document, 'ttq');
        }
      `}
    </Script>
  );
}
