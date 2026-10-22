import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { SpellClient } from "../homework/SpellClient";

/**
 * /exercises: "Practice" (תרגולים) for a grown-up (Gadi 2026-10-22). The
 * same flows as Homework (reading with a comprehension check, getting ready
 * for a test, dictation, learning a language) with adult copy; a child keeps
 * Homework. /practice is the notebook's spaced-repetition review, so this
 * area lives here.
 */
const BASE_METADATA: Metadata = {
  title: "Practice, Gadit",
  description: "Reading with a comprehension check, getting ready for a test, dictation and learning a language.",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("exercises", BASE_METADATA);
}

export default function ExercisesPage() {
  return <SpellClient area="practice" />;
}
