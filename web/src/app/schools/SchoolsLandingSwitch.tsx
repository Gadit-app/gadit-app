"use client";

import { useLang } from "@/lib/lang-context";
import { SchoolsLandingClient } from "./SchoolsLandingClient";
import { SchoolsRealLanding } from "./SchoolsRealLanding";

/**
 * Hebrew visitors get the new real-screens Schools page (approved by Gadi
 * 2026-10-06); every other language keeps the illustrated page until its
 * own version is built. The old Hebrew page stays at /schools/landing-old.
 */
export function SchoolsLandingSwitch({ standalone = false }: { standalone?: boolean }) {
  const { lang } = useLang();
  return lang === "he" ? <SchoolsRealLanding /> : <SchoolsLandingClient standalone={standalone} />;
}
