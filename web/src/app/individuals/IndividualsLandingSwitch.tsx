"use client";

import { useLang } from "@/lib/lang-context";
import { IndividualsLandingClient } from "./IndividualsLandingClient";
import { IndividualsRealLanding } from "./IndividualsRealLanding";

/**
 * Hebrew visitors get the real-screens Individuals page (made final by Gadi
 * 2026-10-07); every other language keeps the earlier page until its own
 * version is translated. Same pattern as SchoolsLandingSwitch.
 */
export function IndividualsLandingSwitch() {
  const { lang } = useLang();
  return lang === "he" ? <IndividualsRealLanding /> : <IndividualsLandingClient />;
}
