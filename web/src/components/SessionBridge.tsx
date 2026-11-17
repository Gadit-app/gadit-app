"use client";

/**
 * On the purchase host gadit.app, sign the visitor in with the session they
 * already have on www.gadit.app (Gadi 2026-10-10), so a subscriber who opens
 * a shared landing page can upgrade without signing in again. A hidden
 * iframe of www.gadit.app/auth/bridge (same site, so it sees the www
 * session) answers with a custom token, or null. Runs once per tab, only
 * on gadit.app, only while signed out.
 *
 * Only for someone signed in on the other host (Gadi 2026-11-17, SEO audit):
 * the bridge page loads the whole site a second time, about 500KB, and it ran
 * for every first-time visitor of a landing page. Now a cookie shared by both
 * hosts (Domain=gadit.app) says whether anyone is signed in on either one:
 * "1" while signed in, "0" after signing out or after the bridge found
 * nobody. The bridge runs only on "1". Until BRIDGE_UNKNOWN_UNTIL, a browser
 * with no cookie at all (signed in before the cookie existed) still gets one
 * bridge, after the page has loaded, and the answer is kept in the cookie.
 */

import { useEffect, useRef } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import { useAuth } from "@/lib/auth-context";

const WWW = "https://www.gadit.app";
const PAY = "https://gadit.app";
const HINT = "gadit_xs";
const BRIDGE_UNKNOWN_UNTIL = Date.parse("2026-12-08T00:00:00Z");

const onGaditHost = () => {
  const host = window.location.hostname;
  return host === "gadit.app" || host === "www.gadit.app";
};

function readHint(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${HINT}=([^;]*)`));
  return m ? m[1] : null;
}

/** Written on every sign-in check, so the year's expiry keeps moving. */
function writeHint(v: "0" | "1") {
  if (!onGaditHost()) return;
  document.cookie = `${HINT}=${v}; Domain=gadit.app; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;
}

export function SessionBridge() {
  const { user, loading } = useAuth();
  const wasSignedIn = useRef(false);

  // Keep the shared cookie in step with this host's sign-in.
  useEffect(() => {
    if (loading) return;
    if (user) {
      wasSignedIn.current = true;
      writeHint("1");
    } else if (wasSignedIn.current) {
      wasSignedIn.current = false;
      writeHint("0");
    }
  }, [loading, user]);

  useEffect(() => {
    // Both ways (Gadi 2026-10-11): a family that bought on gadit.app and then
    // opens an email link on www must arrive signed in too (Yehuda Koren saw
    // a blank family page).
    // Never inside a frame: the bridge page itself runs in one, and two-way
    // bridging must not nest frames.
    if (window.parent !== window) return;
    if (loading || user || !onGaditHost()) return;
    const hint = readHint();
    const unknown = hint === null && Date.now() < BRIDGE_UNKNOWN_UNTIL;
    if (hint !== "1" && !unknown) return;
    const host = window.location.hostname;
    const other = host === "gadit.app" ? WWW : PAY;
    try {
      if (sessionStorage.getItem("gadit_bridge_done")) return;
    } catch { /* private mode: try once per page load */ }
    const done = () => { try { sessionStorage.setItem("gadit_bridge_done", "1"); } catch { /* ignore */ } };
    const frame = document.createElement("iframe");
    frame.src = `${other}/auth/bridge`;
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    let timer = 0;
    let started = false;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== other || (e.data as { type?: string })?.type !== "gadit-session") return;
      const token = (e.data as { token?: string | null }).token;
      done();
      cleanup();
      if (token) void signInWithCustomToken(auth, token).catch(() => { /* stays signed out */ });
      else writeHint("0");
    };
    const start = () => {
      if (started) return;
      started = true;
      window.addEventListener("message", onMessage);
      timer = window.setTimeout(() => { done(); cleanup(); }, 12000);
      document.body.appendChild(frame);
    };
    const onLoad = () => { timer = window.setTimeout(start, 1500); };
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
      frame.remove();
    };
    // Signed in on the other host: right away. Unknown: after the page loaded.
    if (hint === "1") start();
    else if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return cleanup;
  }, [loading, user]);
  return null;
}
