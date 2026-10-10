"use client";

/**
 * On the purchase host gadit.app, sign the visitor in with the session they
 * already have on www.gadit.app (Gadi 2026-10-10), so a subscriber who opens
 * a shared landing page can upgrade without signing in again. A hidden
 * iframe of www.gadit.app/auth/bridge (same site, so it sees the www
 * session) answers with a custom token, or null. Runs once per tab, only
 * on gadit.app, only while signed out.
 */

import { useEffect } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const WWW = "https://www.gadit.app";

export function SessionBridge() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading || user || window.location.hostname !== "gadit.app") return;
    try {
      if (sessionStorage.getItem("gadit_bridge_done")) return;
    } catch { /* private mode: try once per page load */ }
    const done = () => { try { sessionStorage.setItem("gadit_bridge_done", "1"); } catch { /* ignore */ } };
    const frame = document.createElement("iframe");
    frame.src = `${WWW}/auth/bridge`;
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    let timer = 0;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      frame.remove();
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== WWW || (e.data as { type?: string })?.type !== "gadit-session") return;
      const token = (e.data as { token?: string | null }).token;
      done();
      cleanup();
      if (token) void signInWithCustomToken(auth, token).catch(() => { /* stays signed out */ });
    };
    window.addEventListener("message", onMessage);
    timer = window.setTimeout(() => { done(); cleanup(); }, 12000);
    document.body.appendChild(frame);
    return cleanup;
  }, [loading, user]);
  return null;
}
