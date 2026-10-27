"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { isPlayModeClient } from "@/lib/play-copy";
import { isIosApp } from "@/lib/native-app";
import { canBuyInApp } from "@/lib/native-iap";
import { readKidsMode } from "@/lib/use-kids-mode";
import { subscribeCopy } from "@/lib/subscribe-copy";

/**
 * Rendered next to every "not active in this account" notice inside the apps.
 * It tells the server once per screen-visit that a free app user hit a locked
 * feature (api/app-intent: the upgrade email for Play, an alert for Gadi).
 * In an iOS build that sells through the App Store (2026-10-27) it also shows
 * a "See plans" button to /subscribe, for adults only. Renders nothing on the
 * website and in the Android Play app.
 */
export function AppIntentPing({ feature }: { feature: string }) {
  const { user, familyRole } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const [canBuy, setCanBuy] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the device
    setCanBuy(canBuyInApp() && familyRole !== "kid" && !readKidsMode());
  }, [familyRole]);
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
  if (!canBuy) return null;
  return (
    <Link href={href("/subscribe")} className="wb-learn-simple-go" style={{ display: "inline-block", marginTop: 12, textDecoration: "none", maxWidth: 320 }}>
      {subscribeCopy(lang).seePlans}
    </Link>
  );
}
