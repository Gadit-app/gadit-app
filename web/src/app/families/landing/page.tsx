import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { Suspense } from "react";
import FamiliesLandingClient from "../FamiliesLandingClient";

/**
 * /families/landing — the STANDALONE Families landing page, with NO site
 * nav (Gadi 2026-07-29). This is the link to send in a campaign (Meta,
 * email) so it reads as a single product page, without the whole-site menu
 * confusing a cold visitor. The in-site version (with nav) is at /families.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const lang =
    headersList.get("x-gadit-lang") ?? cookieStore.get("gadit-lang")?.value ?? "en";
  const he = lang === "he";
  const ar = lang === "ar";
  return {
    title: ar
      ? "Gadit للعائلات، مكان واحد آمن لفهم كل كلمة"
      : he
      ? "Gadit למשפחות, מקום אחד בטוח להבין כל מילה"
      : "Gadit for Families, one safe place to understand every word",
    description: ar
      ? "كل المعاني، وصورة لكل معنى، وشروحات يفهمها الطفل. بلا محادثة مفتوحة، بلا إعلانات. حتى 5 أطفال في خطة واحدة، تجربة مجانية 14 يوماً."
      : he
      ? "כל המשמעויות, תמונה לכל משמעות והסבר בגובה של ילד. בלי צ'אט פתוח, בלי פרסומות. עד 5 ילדים במנוי אחד, 14 ימי ניסיון חינם."
      : "Every meaning, a picture for each one, and explanations a child understands. No open chat, no ads. Up to 5 kids on one plan, 14-day free trial.",
    robots: { index: false, follow: false },
  };
}

export default function FamiliesLandingRoute() {
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient />
    </Suspense>
  );
}
