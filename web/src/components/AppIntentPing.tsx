"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { isPlayModeClient } from "@/lib/play-copy";
import { isIosApp } from "@/lib/native-app";

/**
 * Rendered next to every "not active in this account" notice inside the apps.
 * It tells the server once per screen-visit that a free app user hit a locked
 * feature (api/app-intent: the upgrade email for Play, an alert for Gadi).
 * Renders nothing; does nothing on the website.
 */
export function AppIntentPing({ feature }: { feature: string }) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.email) return;
    if (!isPlayModeClient() && !isIosApp()) return;
    const key = `gadit_intent_${feature}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* storage blocked */ }
    void (async () => {
      try {
        await fetch("/api/app-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ feature }),
        });
      } catch { /* best-effort */ }
    })();
  }, [user, feature]);
  return null;
}
