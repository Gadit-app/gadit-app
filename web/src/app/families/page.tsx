import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesLandingClient from "./FamiliesLandingClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

/** Localized share (OG/WhatsApp) copy for the Family landing, reused by
 *  the in-site page and the standalone /families/landing campaign page. */
export const FAMILIES_OG: Record<string, ShareCopy> = {
  he: { title: "Gadit למשפחות · מילון חזותי וחכם לכל המשפחה", description: "כל מילה מקבלת הסבר בגובה של ילד, תמונה, דוגמאות ומשחקים. אוצר המילים גדל, ההבנה משתפרת, והילד מצליח יותר בבית הספר. עד 5 ילדים, 14 ימי ניסיון חינם." },
  en: { title: "Gadit for Families · A visual, smart dictionary for the whole family", description: "Every word gets a kid-level explanation, a picture, examples and games. Vocabulary grows, comprehension improves, and your child does better at school. Up to 5 kids, 14-day free trial." },
  ar: { title: "Gadit للعائلات · قاموس ذكي ومصوَّر لكل أفراد العائلة", description: "كل كلمة تحصل على شرح بمستوى الطفل، وصورة، وأمثلة، وألعاب. تنمو الحصيلة اللغوية، ويتحسّن الفهم، ويتقدّم طفلك في المدرسة. حتى 5 أطفال، تجربة مجانية 14 يوماً." },
  ru: { title: "Gadit для семьи · Умный визуальный словарь для всей семьи", description: "Каждое слово получает объяснение на уровне ребёнка, картинку, примеры и игры. Словарный запас растёт, понимание улучшается, ребёнок лучше учится. До 5 детей, 14 дней бесплатно." },
};

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

export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG);
}

export default function FamiliesPage() {
  // In-site version: WITH the top nav, so it lives inside the site and the
  // three products (individuals, Families, Schools) stay reachable. The
  // no-nav campaign version lives at /families/landing.
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient withNav />
    </Suspense>
  );
}
