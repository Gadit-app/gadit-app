import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { Suspense } from "react";
import FamiliesLandingClient from "./FamiliesLandingClient";

/**
 * /families — the Family-plan campaign landing page.
 *
 * Born from the July 2026 marketing synthesis (our council + three
 * external AIs, unanimous): the cold funnel leads with FAMILY (annual
 * anchor $59/₪199), not Clear; safety is the closer, pain is the
 * hook. This page is the destination for the warm-list email test and
 * later for cold Meta traffic.
 *
 * ?v=relief|anxiety|safe swaps the hero angle so three email variants
 * can share one page while we measure which angle converts. Default:
 * relief (the "stop being the house dictionary" interruption angle).
 *
 * Hebrew-first (the first campaign is the Israeli warm list), English
 * fallback for every other locale.
 */

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const lang =
    headersList.get("x-gadit-lang") ?? cookieStore.get("gadit-lang")?.value ?? "en";
  const he = lang === "he";
  return {
    title: he ? "Gadit למשפחות, מקום אחד בטוח להבין כל מילה" : "Gadit for Families, one safe place to understand every word",
    description: he
      ? "כל המשמעויות, תמונה לכל משמעות והסבר בגובה של ילד. בלי צ'אט פתוח, בלי פרסומות. עד 5 ילדים במנוי אחד, 14 ימי ניסיון חינם."
      : "Every meaning, a picture for each one, and explanations a child understands. No open chat, no ads. Up to 5 kids on one plan, 14-day free trial.",
  };
}

export default function FamiliesPage() {
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient />
    </Suspense>
  );
}
