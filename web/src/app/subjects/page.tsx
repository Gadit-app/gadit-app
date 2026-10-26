import { Suspense } from "react";
import type { Metadata } from "next";
import { resolveShareLang } from "@/lib/landing-metadata";
import { SubjectsClient } from "./SubjectsClient";

/**
 * /subjects (/he/subjects, /en/subjects, /de/subjects): key words by school
 * subject for Family and Individual (Gadi 2026-10-26). Sign-in and plan
 * gating happen in the client, like the other tools. Not indexed.
 */
const TITLES: Record<string, string> = {
  he: "מילות מפתח במקצועות, Gadit",
  en: "Key words by subject, Gadit",
  de: "Schlüsselwörter nach Fach, Gadit",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveShareLang();
  return { title: TITLES[lang] ?? TITLES.en, robots: { index: false, follow: false } };
}

export default function SubjectsPage() {
  // useSearchParams (the step lives in the address) needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SubjectsClient />
    </Suspense>
  );
}
