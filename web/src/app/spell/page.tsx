import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { SpellClient } from "./SpellClient";

const BASE_METADATA: Metadata = {
  title: "Spelling practice, Gadit",
  description:
    "Practice your school spelling and dictation words. Gadit reads a word aloud and you write it, in Hebrew or English, with instant feedback.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("spell", BASE_METADATA);
}

export default function SpellPage() {
  return <SpellClient />;
}
