import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { SpellClient } from "./SpellClient";

const BASE_METADATA: Metadata = {
  title: "Homework, Gadit",
  description:
    "Tonight's practice in one place: getting ready for a test, dictation, learning languages and reading texts.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("spell", BASE_METADATA);
}

export default function HomeworkPage() {
  return <SpellClient />;
}
