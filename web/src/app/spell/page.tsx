import type { Metadata } from "next";
import { SpellClient } from "./SpellClient";

export const metadata: Metadata = {
  title: "Spelling practice, Gadit",
  description:
    "Practice your school spelling and dictation words. Gadit reads a word aloud and you write it, in Hebrew or English, with instant feedback.",
};

export default function SpellPage() {
  return <SpellClient />;
}
