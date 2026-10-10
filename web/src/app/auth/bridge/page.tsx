"use client";

/**
 * /auth/bridge — a blank page that gadit.app loads in a hidden iframe to
 * borrow the visitor's www.gadit.app session (see /api/auth/handoff and
 * SessionBridge). It posts a custom token, or null when nobody is signed
 * in, to the purchase host ONLY (postMessage target origin), so no other
 * site that frames it can read anything.
 */

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const PAY_ORIGIN = "https://gadit.app";

export default function AuthBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsub();
      let token: string | null = null;
      if (u) {
        try {
          const res = await fetch("/api/auth/handoff", { method: "POST", headers: { Authorization: `Bearer ${await u.getIdToken()}` } });
          if (res.ok) token = ((await res.json()) as { token?: string }).token ?? null;
        } catch { /* stay signed out on gadit.app */ }
      }
      window.parent.postMessage({ type: "gadit-session", token }, PAY_ORIGIN);
    });
    return () => unsub();
  }, []);
  return null;
}
