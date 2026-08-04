import type { Metadata } from "next";
import { SchoolsLandingClient } from "./SchoolsLandingClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

/** Localized share (OG/WhatsApp) copy for the Schools landing, reused by
 *  the in-site page and the standalone /schools/landing campaign page. */
export const SCHOOLS_OG: Record<string, ShareCopy> = {
  he: { title: "Gadit לבתי ספר · כל תלמיד מבין את השיעור", description: "כשתלמיד לא מבין מילה, הוא לא מבין את החומר. Gadit נותן לכל תלמיד להבין כל מילה קשה, בשפה שלו, ב-14 שפות. בלי חשבונות לתלמידים, בלי הקמה. 14 ימי ניסיון חינם." },
  en: { title: "Gadit for Schools · Every student understands the lesson", description: "When a student doesn't understand a word, they don't understand the material. Gadit explains any hard word, in the student's own language, across 14 languages. No student accounts, no setup. 14-day free trial." },
  ar: { title: "Gadit للمدارس · كل طالب يفهم الدرس", description: "حين لا يفهم الطالب كلمة، لا يفهم المادة. يشرح Gadit أي كلمة صعبة، بلغة الطالب نفسه، بـ 14 لغة. بلا حسابات للطلاب، بلا إعداد. تجربة مجانية 14 يوماً." },
  ru: { title: "Gadit для школ · Каждый ученик понимает урок", description: "Когда ученик не понимает слово, он не понимает материал. Gadit объясняет любое трудное слово на языке самого ученика, на 14 языках. Без аккаунтов для учеников, без настройки. 14 дней бесплатно." },
};

/**
 * /schools — public marketing landing page for the Schools tier.
 *
 * Architecture (after Gadi's 2026-06-29 council synthesis + 3-AI
 * review):
 *   1. Hero            — H1 + sub + sticky price chip + CTA
 *   2. The Problem     — pedagogical, "words you don't see kids miss"
 *   3. How It Works    — 3-step setup (code → join → see)
 *   4. Teacher View    — annotated dashboard mockup
 *   5. Privacy Moat    — diagram + "Kahoot-style classroom code"
 *   6. Pricing         — 2 cards, 14-day trial
 *   7. FAQ             — 8 blocker-removal questions
 *   8. Final CTA       — same button repeated
 *
 * Dashboard for paying school owners lives at /schools/manage now;
 * the landing client auto-redirects them on mount so the principal
 * who clicks "Schools" in the topbar lands in their dashboard
 * (not on marketing copy).
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG);
}

export default function SchoolsLandingRoute() {
  return <SchoolsLandingClient />;
}
